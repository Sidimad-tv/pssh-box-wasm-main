import init, { code_version } from "../pkg/pssh_box_wasm.js";
init().then(() => {
    document.getElementById("version").innerHTML = code_version();
});

// Normally we could load these simply with "micropip.install('pywidevine')". However, pywidevine
// version 1.8.0 depends on pymp4 version 1.4.0, which depends on a very old version of construct,
// v2.8.8, for which a prebuilt wheel is not available on pip. Therefore, we load our packages manually.
const myPackages = [
    "https://files.pythonhosted.org/packages/ec/1a/610693ac4ee14fcdf2d9bf3c493370e4f2ef7ae2e19217d7a237ff42367d/packaging-23.2-py3-none-any.whl",
    "https://files.pythonhosted.org/packages/a2/73/a68704750a7679d0b6d3ad7aa8d4da8e14e151ae82e6fee774e6e0d05ec8/urllib3-2.2.1-py3-none-any.whl",
    "https://files.pythonhosted.org/packages/70/8e/0e2d847013cb52cd35b38c009bb167a1a26b2ce6cd6965bf26b47bc0bf44/requests-2.31.0-py3-none-any.whl",
    "https://files.pythonhosted.org/packages/2d/14/d1bf3b7141ad5a42c26e4173a69e3e6529bd92b05bc587c570d28b6a3ce8/pyodide_http-0.2.1-py3-none-any.whl",
    "https://files.pythonhosted.org/packages/c2/e7/a82b05cf63a603df6e68d59ae6a68bf5064484a0718ea5033660af4b54a9/idna-3.6-py3-none-any.whl",
    "https://files.pythonhosted.org/packages/ba/06/a07f096c664aeb9f01624f858c3add0a4e913d6c96257acb4fce61e7de14/certifi-2024.2.2-py3-none-any.whl",
    "https://files.pythonhosted.org/packages/28/76/e6222113b83e3622caa4bb41032d0b1bf785250607392e1b778aca0b8a7d/charset_normalizer-3.3.2-py3-none-any.whl",
    "pycryptodome",
    "protobuf",
    "https://files.pythonhosted.org/packages/41/9f/60f8a4c8e7767a8c34f5c42428662e03fa3e38ad18ba41fcc5370ee43263/pywidevine-1.8.0-py3-none-any.whl",
    "https://files.pythonhosted.org/packages/aa/a2/27fea39af627c0ce5dbf6108bf969ea8f5fc9376d29f11282a80e3426f1d/pymp4-1.4.0-py3-none-any.whl"
]
window.pyodide = await loadPyodide({ packages: myPackages });
console.log("Pyodide + pywidevine loaded");
if (typeof window.pyodide.setDebug === 'function') {
    window.pyodide.setDebug(true);
}

const py_import = `...
`;

const py_parse_pssh = `...
`;

const py_license = `...
`;

function updateLogElement() {
    document.getElementById("log").innerHTML = "<pre>" + pyodide.globals.get("log") + "</pre>";
}

async function get_license(wvd_b64, pssh, lurl, headers) {
    pyodide.globals.set("wvd_b64", wvd_b64);
    pyodide.globals.set("pssh", pssh);
    pyodide.globals.set("lurl", lurl);
    pyodide.globals.set("headers", pyodide.runPython(headers));
    pyodide.runPython(py_import);
    updateLogElement();
    document.getElementById("logs").style.visibility = "visible";
    var pssh_ok = false;
    try {
        pssh_ok = pyodide.runPython(py_parse_pssh);
    } catch (e) {
        pssh_ok = false;
        document.getElementById("log").innerHTML = "<pre>" +
            e.toString().replace("
", "<br>") + "</pre>";
    }
    if (!pssh_ok) {
        out.scrollIntoView();
        out.style.visibility = "visible";
        out.classList.add("failed");
        out.innerHTML = "<h3>Not a valid PSSH</h3>";
        return;
    }
    try {
        let have_license = pyodide.runPython(py_license);
        updateLogElement();
        if (have_license) {
            out.classList.remove("failed");
            out.scrollIntoView();
            out.style.visibility = "visible";
            out.innerHTML = "<h3>Decryption keys</h3>" + pyodide.globals.get("html");
        } else {
            out.innerHTML = "Licence request failed (see logs)";
            out.classList.add("failed");
            updateLogElement();
        }
    } catch (e) {
        updateLogElement();
        out.classList.add("failed");
        out.innerHTML = "<h3>Python error</h3><p>" + e.toString().replace("
", "<br>");
    }
    out.scrollIntoView();
    out.style.visibility = "visible";
}}]
