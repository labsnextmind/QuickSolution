document.getElementById("askBtn").addEventListener("click", async () => {
  const questionInput = document.getElementById("question");
  const subject = document.getElementById("subject").value;
  const answerDiv = document.getElementById("answer");
  const imageFile = document.getElementById("imageUpload").files[0];

  let questionText = questionInput.value.trim();
  answerDiv.innerHTML = "<p>Processing...</p>";

  try {
    if (imageFile && !questionText) {
      const formData = new FormData();
      formData.append("image", imageFile);
      const ocrRes = await fetch("/api/ocr", { method: "POST", body: formData });
      const ocrData = await ocrRes.json();
      questionText = ocrData.text || "";
      questionInput.value = questionText;
    }

    if (!questionText) {
      answerDiv.innerHTML = "<p>Please type or upload a question first!</p>";
      return;
    }

    const res = await fetch("/api/getAnswer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: questionText, subject })
    });

    const data = await res.json();
    answerDiv.innerHTML = `<p>${data.answer}</p>`;
  } catch (error) {
    answerDiv.innerHTML = `<p>Error: ${error.message}</p>`;
  }
});