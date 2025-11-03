elSteps.addEventListener("click",()=>{
  const q = elPrompt.value.trim().toLowerCase();
  const txt = elSolution.textContent || "";

  if(!txt || txt === "Your answer will appear here.") {
    show("Please ask a question first.");
    return;
  }

  // Check if it's a math result
  if(txt.includes("Result:")) {
    show(txt + "\n\nSteps:\n1) Identify the math expression\n2) Replace × and ÷ with * and /\n3) Evaluate safely and display the numeric result");
    return;
  }

  // Try to provide logical steps dynamically
  if(q.includes("photosynthesis")) {
    show(txt + "\n\nSteps:\n1) Light absorbed by chlorophyll\n2) Water splits, releasing oxygen\n3) CO2 converted to glucose\n4) Energy stored in sugars");
  } 
  else if(q.includes("cell")) {
    show(txt + "\n\nSteps:\n1) Define cell as life’s structural unit\n2) Identify cell parts (nucleus, membrane, etc.)\n3) Explain their functions\n4) Relate to living systems");
  }
  else if(q.includes("democracy")) {
    show(txt + "\n\nSteps:\n1) Define democracy\n2) Explain representation and voting\n3) Discuss institutions ensuring balance of power");
  }
  else if(q.includes("thermodynamics")) {
    show(txt + "\n\nSteps:\n1) Identify type of system (open/closed)\n2) Apply laws (0th, 1st, 2nd)\n3) Calculate energy exchange");
  }
  else {
    show(txt + "\n\nLogical Steps:\n1) Read and understand the concept\n2) Break it into main ideas\n3) Use examples or comparisons\n4) Connect to real-world applications");
  }
});