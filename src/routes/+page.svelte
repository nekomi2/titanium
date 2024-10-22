<script lang="ts">
  import { FFmpeg } from "@ffmpeg/ffmpeg";
  import { onMount, tick } from "svelte";
  import { fetchFile, checkVideoURL, getFormat, isValidUrl } from "$lib/utils";
  let inputValue = "";
  let isValidVideoURL = false;
  let state:
    | "loading"
    | "loaded"
    | "processing"
    | "done"
    | "no_conversion"
    | "error" = "loading";
  let ffmpeg: FFmpeg;
  let outputUrl: string;
  let videoAnchor: HTMLAnchorElement;
  async function handleInput(event: any) {
    if (!isValidUrl(inputValue)) {
      isValidVideoURL = false;
      return;
    }
    if (inputValue.endsWith(".mp4")) {
      isValidVideoURL = true;
      try {
        const file = await fetch(inputValue);
        const blob = await file.blob();
        outputUrl = URL.createObjectURL(blob);
        state = "no_conversion";
        await tick();
        videoAnchor.click();
        return;
      } catch (error) {
        state = "error";
      }
    }
    isValidVideoURL = checkVideoURL(inputValue);
    if (isValidVideoURL) {
      await convertToMp4(inputValue);
    }
  }

  async function convertToMp4(url: string) {
    try {
      state = "processing";
      const format = getFormat(url);
      const inputFileName = `input.${format}`;
      const outputFileName = "output.mp4";

      // Fetch the file and write it to FFmpeg's file system
      const data = await fetchFile(url);
      await ffmpeg.writeFile(inputFileName, data);

      // Run FFmpeg command to convert WebM to MP4
      await ffmpeg.exec(["-i", inputFileName, outputFileName]);

      // Read the output file
      const outputData = await ffmpeg.readFile(outputFileName);
      const outputBlob = new Blob([outputData], { type: "video/mp4" });
      outputUrl = URL.createObjectURL(outputBlob);

      state = "done";
    } catch (error) {
      console.error("Error converting video");
      console.error(error);
      state = "error";
    }
  }

  async function loadFFmpeg() {
    const baseURL = "/ffmpeg";
    ffmpeg = new FFmpeg();
    ffmpeg.on("log", ({ message }) => {
      console.log(message);
    });

    await ffmpeg.load({
      coreURL: `${baseURL}/ffmpeg-core.js`,
      wasmURL: `${baseURL}/ffmpeg-core.wasm`,
    });
    state = "loaded";
    console.log("FFmpeg loaded");
  }

  onMount(async () => {
    await loadFFmpeg();
  });

  const videoUrl =
    "https://test-videos.co.uk/vids/bigbuckbunny/webm/vp9/1080/Big_Buck_Bunny_1080_10s_1MB.webm";

  function copyToClipboard() {
    navigator.clipboard.writeText(videoUrl).catch((err) => {
      console.error("Failed to copy: ", err);
    });
  }
</script>

<div class="mainbox">
  <h1>Titanium</h1>
  <h2>Transcode videos in your browser</h2>
  <input
    class="url-input"
    type="text"
    placeholder="Insert video link"
    bind:value={inputValue}
    on:input={handleInput}
    disabled={state === "loading"}
  />
  {#if state === "loading"}
    <p>Loading ffmpeg...</p>
  {:else if !isValidVideoURL}
    <p>
      Not a valid video URL. To try, click to copy this link
      <br />
      <a href="#" on:click|preventDefault={copyToClipboard}>
        "{videoUrl}"
      </a>
    </p>
  {:else}
    <p>Valid video URL!</p>
  {/if}
  {#if state === "processing"}
    <p>Converting video...</p>
  {:else if state === "done"}
    <p>Conversion complete!</p>
    <video
      style="
    max-width: 300px;
    max-height: 300px;
    "
      src={outputUrl}
      controls
    >
      <track kind="captions" />
    </video>
  {:else if state === "no_conversion"}
    <a bind:this={videoAnchor} href={outputUrl} download={outputUrl}
      >Downloading...</a
    >
  {:else if state === "error"}
    <p>Error converting video. Try uploading the video instead</p>
  {/if}
</div>

<style>
  .mainbox {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    height: 100vh;
    margin: 1rem;
  }
  .url-input {
    background: none;
    border: none;
    border-bottom: 1px solid gray;
    outline: none;
    font-size: 0.8rem;
    height: 2rem;
    color: white;
  }
</style>
