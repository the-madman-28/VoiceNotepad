export async function transcribeWithWhisper(blob, backendUrl) {
  const formData = new FormData();
  formData.append("audio", blob, "audio.webm");

  const res = await fetch(`${backendUrl}/transcribe`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Failed transcription");
  }

  const data = await res.json();
  return data.text || "";
}
