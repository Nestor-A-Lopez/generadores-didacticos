// ---------------------------------------------------------------
// Guardado del SVG exportado, igual en todos los generadores.
// Cada generador arma el SVG y su nombre de archivo en su download()
// y llama a Banco.guardarSVG(svg, filename).
//
// - Chrome/Edge: showSaveFilePicker. Se guarda el último archivo
//   elegido (lastSaveHandle) para que el diálogo se abra en esa misma
//   carpeta durante la sesión (startIn).
// - Otros navegadores, o si el diálogo falla por algo que no sea
//   cancelar: descarga clásica con <a download>.
// El atajo de Enter para guardar se queda en cada generador, porque
// cada uno lo pone en campos distintos.
// ---------------------------------------------------------------
window.Banco = window.Banco || {};

(function () {
  let lastSaveHandle = null;

  Banco.guardarSVG = async function (svg, filename) {
    if (window.showSaveFilePicker) {
      try {
        const options = {
          suggestedName: filename,
          types: [
            {
              description: "Imagen SVG",
              accept: { "image/svg+xml": [".svg"] },
            },
          ],
        };
        if (lastSaveHandle) options.startIn = lastSaveHandle;
        const handle = await window.showSaveFilePicker(options);
        const writable = await handle.createWritable();
        await writable.write(svg);
        await writable.close();
        lastSaveHandle = handle;
        return;
      } catch (err) {
        if (err && err.name === "AbortError") return;
      }
    }

    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
})();
