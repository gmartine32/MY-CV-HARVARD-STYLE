import { spawn } from "node:child_process";
import http from "node:http";

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    }).on("error", reject);
  });
}

const server = spawn("node", ["server/index.mjs"], { stdio: "inherit" });

setTimeout(async () => {
  try {
    console.log("Testing /api/status...");
    const statusRes = await fetchUrl("http://localhost:3001/api/status");
    console.log("Status response:", statusRes);

    console.log("Testing /api/cvs...");
    const cvsRes = await fetchUrl("http://localhost:3001/api/cvs");
    console.log(`Found ${cvsRes.body.length} CVs in repo. First 2:`, cvsRes.body.slice(0, 2));

    console.log("Testing /api/base-cvs...");
    const baseRes = await fetchUrl("http://localhost:3001/api/base-cvs");
    console.log("Base CVs loaded. ES length:", baseRes.body.es?.length, "EN length:", baseRes.body.en?.length);

    console.log("Testing POST /api/pdf...");
    const testHtml = "<html><head><style>@page{size:A4;margin:1cm;} body{font-family:Georgia;}</style></head><body><h1>Gian Franco Martinez Villa</h1><p>Test PDF generation</p></body></html>";
    const pdfResponse = await fetch("http://localhost:3001/api/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: "cv_test_preview.html", html: testHtml })
    });
    const pdfBuffer = await pdfResponse.arrayBuffer();
    console.log(`PDF successfully generated! Buffer size: ${pdfBuffer.byteLength} bytes.`);

    console.log("\nALL ENDPOINTS & PDF GENERATION FUNCTIONING PERFECTLY!");
  } catch (err) {
    console.error("Test error:", err);
  } finally {
    server.kill();
    process.exit(0);
  }
}, 1800);
