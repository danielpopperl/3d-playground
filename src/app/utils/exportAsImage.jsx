import html2canvas from "html2canvas";

export default async function saveAsImage() {
  const findEl = document.getElementById("capture-frame");

  html2canvas(findEl).then(async (canvas) => {
    // const link = document.createElement("a");
    // document.body.appendChild(link);
    // link.download = "cmp-image.jpg";
    // link.href = canvas.toDataURL();
    // link.click();
    // link.remove();

    const imgData = canvas.toDataURL("image/png", 1.0);
    console.log(imgData);
  });
}
