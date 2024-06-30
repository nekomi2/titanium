<script lang="ts">
  import { FFmpeg } from "@ffmpeg/ffmpeg";
  import { onMount, tick } from "svelte";
  import { fetchFile, checkVideoURL } from "$lib/utils";
  let inputValue = "";
  let isValidVideoURL = false;
  let state: "loading" | "loaded" | "processing" | "done" | "error" = "loading";
  let ffmpeg: FFmpeg;
  let outputUrl: string;
  async function handleInput(event: any) {
    isValidVideoURL = checkVideoURL(inputValue);
    if (isValidVideoURL) {
      await convertToMp4(inputValue);
    }
  }

  async function convertToMp4(url: string) {
    try {
      state = "processing";
      const inputFileName = "input.webm";
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
      console.error("Error converting video, probably blocked by CORS.");
      console.error(error);
      state = "error";
    }
  }

  async function loadFFmpeg() {
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.4/dist/esm";
    ffmpeg = new FFmpeg();
    ffmpeg.on("log", ({ message }) => {
      console.log(message);
    });

    await ffmpeg.load({
      coreURL: `${baseURL}/ffmpeg-core.js`,
      wasmURL: `${baseURL}/ffmpeg-core.wasm`,
      workerURL: `${baseURL}/ffmpeg-core.worker.js`,
    });
    state = "loaded";
    console.log("FFmpeg loaded");
  }

  onMount(async () => {
    await loadFFmpeg();
  });
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
  />

  {#if !isValidVideoURL}
    <p>Not a valid video URL.</p>
  {:else}
    <p>Valid video URL!</p>
  {/if}
  {#if state === "processing"}
    <p>Converting video...</p>
  {:else if state === "done"}
    <p>Conversion complete!</p>
    <video src={outputUrl} controls>
      <track kind="captions" />
    </video>
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
    height: 100vh;
  }
  .url-input {
    background: none;
    border: none;
    border-bottom: 1px solid gray;
    outline: none;
    font-size: 0.8rem;
    height: 2rem;
  }
</style>
