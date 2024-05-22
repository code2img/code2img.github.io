import { codeToHtml } from "/lib/shiki@1.5.2.js";

async function formatCode() {
  const codeBlockWrapper = document.getElementById("code-block");
  const content = codeBlockWrapper.innerText;
  console.log(content);
  const lang = document.getElementById("language-selector").value;

  codeBlockWrapper.innerHTML = await codeToHtml(content, {
    lang,
    theme: "github-dark",
  });
  const codeBlock = codeBlockWrapper.getElementsByTagName("code")[0];
  codeBlock.contentEditable = true;

  // Handle focus and input events
  codeBlock.addEventListener("focus", () => {
    if (codeBlock.textContent === "// Your code here") {
      codeBlock.textContent = "";
      codeBlock.style.color = ""; // Reset style
    }
  });

  const addPlaceholder = () => {
    if (codeBlock.textContent === "") {
      codeBlock.textContent = "// Your code here";
      codeBlock.style.color = "lightgray";
    }
  };
  codeBlock.addEventListener("blur", addPlaceholder());
  addPlaceholder();

  // Ensure format free copy-paste
  codeBlock.addEventListener("paste", (event) => {
    event.preventDefault(); // Prevent default paste behavior
    const text = event.clipboardData.getData("text/plain"); // Get plain text

    document.execCommand("insertText", false, text); // Insert the plain text
  });
}

async function onFormat() {
  await formatCode();
  addListeners();
}
function addListeners() {
  const codeBlock = document
    .getElementById("code-block")
    .getElementsByTagName("pre")[0]
    .getElementsByTagName("code")[0];
  codeBlock.addEventListener("blur", onFormat);
}

async function elementToImageBlob(elementId) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID "${elementId}" not found.`);
    return;
  }

  try {
    const scaleFavtor = parseInt(document.getElementById("scale-factor").value);
    const canvas = await html2canvas(element, {
      scale: scaleFactor,
      backgroundColor: null,
    });
    const blob = await new Promise((resolve) => canvas.toBlob(resolve));
    return blob;
  } catch (error) {
    console.error("Error capturing element as image:", error);
  }
}

async function copyElementAsImage(elementId) {
  const blob = await elementToImageBlob(elementId);
  try {
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    console.log("Image copied to clipboard!");
  } catch (error) {
    console.log(blob);
    console.error("Error writing to clipboard:", error);
  }
}

async function downloadElementAsImage(elementId) {
  const blob = await elementToImageBlob(elementId);

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "code.png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

async function onCopy() {
  const codeBlockWrapper = document.getElementById("code-block");
  codeBlockWrapper.classList.add("code-block-screenshot");
  await copyElementAsImage("code-block");
  codeBlockWrapper.classList.remove("code-block-screenshot");
}

async function onDownload() {
  const codeBlockWrapper = document.getElementById("code-block");
  codeBlockWrapper.classList.add("code-block-screenshot");
  await downloadElementAsImage("code-block");
  codeBlockWrapper.classList.remove("code-block-screenshot");
}

function addBrowserThemeColor() {
  // Get the meta tag and the computed style
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  const rootStyle = getComputedStyle(document.documentElement);

  // Function to update the theme color
  function updateThemeColor() {
    const themeColor = rootStyle.getPropertyValue("--background-color");
    themeColorMeta.content = themeColor;
  }

  // Initial update and update on theme change
  updateThemeColor();
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", updateThemeColor);
}

async function onLoad() {
  addBrowserThemeColor();
  await formatCode();
  addListeners();
  document.getElementById("copy-button").addEventListener("click", onCopy);
  document
    .getElementById("download-button")
    .addEventListener("click", onDownload);
  document
    .getElementById("language-selector")
    .addEventListener("change", onFormat);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js");
  }
}

onLoad();
