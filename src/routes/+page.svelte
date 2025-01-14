<script lang="ts">
  import { FFmpeg } from "@ffmpeg/ffmpeg";
  import { onMount, tick } from "svelte";
  import { fetchFile, checkVideoURL, getFormat, isValidUrl } from "$lib/utils";
  import Dropzone from './Dropzone.svelte';
  let inputValue = "";
  let isValidVideoURL = false;
  let state:
    | "loading"
    | "loaded"
    | "processing"
    | "done"
    | "no_conversion"
    | "error"
    | "uploading" = "loading";
  let ffmpeg: FFmpeg;
  let outputUrl: string;
  let videoAnchor: HTMLAnchorElement;
  let uploadedFile: File | null = null;

  async function handleInput(event: any) {
    if (event.target.type === "file") {
      uploadedFile = event.target.files[0];
      if (uploadedFile) {
        await convertToMp4(uploadedFile);
      }
      return;
    }

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

  async function convertToMp4(input: string | File) {
    try {
      state = "processing";
      let inputFileName: string;
      let data: Uint8Array;

      if (typeof input === "string") {
        const format = getFormat(input);
        inputFileName = `input.${format}`;
        data = await fetchFile(input);
      } else {
        inputFileName = input.name;
        data = new Uint8Array(await input.arrayBuffer());
      }

      const outputFileName = "output.mp4";

      // Write the file to FFmpeg's file system
      await ffmpeg.writeFile(inputFileName, data);

      // Run FFmpeg command to convert to MP4
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
  <div class="dropzone">
    <Dropzone
      on:change={handleInput}
      accept="video/*"
      multiple={false}
      disabled={state === "loading"}
    >
    </Dropzone>
  </div>
  
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
  .dropzone {
    border-radius: 4px;
    margin: 1rem 0 2rem 0;
  }
</style>
