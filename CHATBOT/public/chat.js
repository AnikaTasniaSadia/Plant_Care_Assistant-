const chatBox = document.getElementById("chat");
const input = document.getElementById("userInput");

function addMessage(text, role) {
  const div = document.createElement("div");
  div.className = `message ${role}`;
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const message = input.value.trim();
  if (!message) return;

  addMessage(message, "user");
  input.value = "";

  addMessage("Thinking...", "bot");

  try {
    const response = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await response.json();
    chatBox.lastChild.remove();
    addMessage(data.reply, "bot");

  } catch (err) {
    chatBox.lastChild.remove();
    addMessage("Backend not responding.", "bot");
    console.error(err);
  }
}

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
