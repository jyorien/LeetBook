var modal = createModal()
var isVisible = false
var isLoaded = false
function createModal() {
    const modal = document.createElement("div")
    modal.id = "record_modal"
    modal.innerHTML = `
    <div id="modal_content"> 
    <button id="close">Close</button>

    <div> 
        <p style="width: 100%">Problem ID</p>
        <input id="problem_id" type="text" disabled/>
    </div>

    <div>
        <p>Problem Name</p>
        <input id="problem_name" type="text" disabled/>
    </div>

    <div>
        <p>Problem Difficulty</p>
        <input id="problem_difficulty" type="text" disabled/>
    </div>

    <div>
        <p>Problem URL</p>
        <input id="problem_url" type="text" disabled/>
    </div>

    <div>
        <p>Problem Topics</p>
        <input id="problem_topics" type="text" disabled/>
    </div>
    
   <div>
        <p>How difficult did you find the problem?</p>
        <div style="display: flex; column-gap: 20px;">
            <div>
                <input id="confidence_easy" type="radio" name="confidence" value="3" checked/>
                <label for="confidence_easy">Easy</label>
            </div>

            <div>
                <input id="confidence_moderate" type="radio" name="confidence" value="2"/>
                <label for="confidence_moderate">Moderate</label>
            </div>

            <div>
                <input id="confidence_difficult" type="radio" name="confidence" value="1"/>
                <label for="confidence_diffiuclt">Difficult</label>
            </div>
        </div>
    </div>

    <div style="flex-grow: 1; display: flex; flex-direction: column">
        <p>Comments</p>
        <textarea id="problem_comment" style="width: 100%; height: 100%; background-color: #2E2E2E"> </textarea>
    </div>

    <div style="display: flex; justify-content: center;">
        <button id="submit" style="width: 50%; background-color: #2E2E2E; padding: 10px; border: 2px solid #505050;">Submit</button>
    </div>
    <p id="status" style="text-align: center"></p>



    </div>`
    // modal container styling
    modal.style.cssText = `
        display: none; /* Hidden by default */
        position: fixed; /* Fixed position */
        top: 0;
        left: 0;
        width: 100vw; /* Full viewport width */
        height: 100vh; /* Full viewport height */
        align-items: center; /* Center vertically */
        justify-content: center;
        z-index: 9999; /* Ensure it's above other elements */
    `;
    document.body.appendChild(modal)

    // actual modal styling
     const modalContent = modal.querySelector("#modal_content");
     modalContent.style.cssText = `
        width: 75vw;
        height: 75vh;
        padding: 20px;
        border-radius: 20px;
        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
        background: #333; 
        display: flex;
        flex-direction: column;
        row-gap: 10px;
     `;

    const closeBtn = modal.querySelector("#close")
    closeBtn.style.width = "100%"
    closeBtn.style.textAlign = "end"
    closeBtn.addEventListener("click", () => {
        modal.style.display = "none"
        isVisible = false
        modal.querySelector("#status").style.display = "none"
        modal.querySelector("#problem_comment").value = ""
    })

    return modal
}


function getProblemDetails(modal) {
    const topicElement = document.getElementsByClassName("mt-2 flex flex-wrap gap-1 pl-7")[0]
    const problemElement = document.getElementsByClassName("no-underline hover:text-blue-s dark:hover:text-dark-blue-s truncate cursor-text whitespace-normal hover:!text-[inherit]")[0]
    const problem = problemElement.innerText.split(".")
    const problemDifficultyElement = document.body.getElementsByClassName("relative inline-flex items-center justify-center text-caption px-2 py-1 gap-1 rounded-full bg-fill-secondary")[0]

    const topics = topicElement.innerText
    const problemNumber = Number(problem[0].split(".")[0])
    const problemName = problem[1].trim()
    const problemDifficulty = problemDifficultyElement.childNodes[0].textContent

    const link = document.URL
    const modalProblemIdElement = modal.querySelector("#problem_id")
    const modalProblemNameElement = modal.querySelector("#problem_name")
    const modalProblemTopicsElement = modal.querySelector("#problem_topics")
    const modalProblemUrlElement = modal.querySelector("#problem_url")
    const modalProblemDifficultyElement = modal.querySelector("#problem_difficulty")
    const modalCommentElement = modal.querySelector("#problem_comment")
    const modalSubmitButton = modal.querySelector("#submit")
    const submissionStatusElement = modal.querySelector("#status")

    const inputStyle = "width: 100%; background-color: #2E2E2E; border-radius: 5px; border: 2px solid #505050; padding: 5px; color: black"
    modalProblemIdElement.style = inputStyle
    modalProblemNameElement.style = inputStyle
    modalProblemTopicsElement.style = inputStyle
    modalProblemUrlElement.style = inputStyle
    modalProblemDifficultyElement.style = inputStyle

    modalProblemIdElement.placeholder = problemNumber
    modalProblemNameElement.placeholder = problemName
    modalProblemTopicsElement.placeholder = topics
    modalProblemUrlElement.placeholder = link
    modalProblemDifficultyElement.placeholder = problemDifficulty

    modalSubmitButton.addEventListener("click", () => {
        const comment = modalCommentElement.value
        const confidence = Number(document.querySelector('input[name="confidence"]:checked').value)
        chrome.runtime.sendMessage({
            action: "submit",
            payload: {
                problemNumber,
                problemName,
                topics,
                link,
                problemDifficulty,
                confidence,
                comment
            }
        }, (res) => {
            if (res.success) {
                console.log("Problem submitted successfully:", res.data);
                submissionStatusElement.style.display = "block"
                submissionStatusElement.textContent = "Submission success! You may close the tab."
            } else {
                console.error("Submission failed:", res.error);
                submissionStatusElement.style.display = "block"
                submissionStatusElement.textContent = `Submission failed! Error: ${res.error}`
            }
        })
        
    })
    
}

function displayPopup(modal) {
    if (!isVisible) {
        modal.style.display = "flex"
        
    }
    else {
        modal.style.display = "none"
    }
    isVisible = true
}
function injectButton(modal) {
    const parent = document.querySelector("#ide-top-btns > div.relative.flex");
    if (parent) {
        console.log("Parent container found!");
        const div = document.createElement("div")
        div.classList.add("relative", "flex", "overflow-hidden", "rounded", "bg-fill-tertiary", "dark:bg-fill-tertiary", "ml-[6px]")
        const button = document.createElement("button");
        button.textContent = "Record 📝";
        button.classList.add("font-medium", "items-center", "whitespace-nowrap", "focus:outline-none", "inline-flex", "rounded-none", "py-1.5", "px-3", "bg-transparent", "dark:bg-transparent", "text-text-primary", "dark:text-text-primary");
        button.addEventListener("click", () => {
            displayPopup(modal)
        });
        div.appendChild(button)
        parent.appendChild(div);

        console.log("Custom button injected successfully!");
    } else {
        console.warn("Parent container not found.");
    }
}

// Check if DOM is already loaded
if (document.readyState === "loading") {
    
    document.addEventListener("DOMContentLoaded", () => {
        console.log("DOMContentLoaded event fired.");
        if (!isLoaded ) {
            injectButton(modal)
            getProblemDetails(modal)
            isLoaded = true
        }

    });
} else {
    console.log("DOM already loaded.");
    if (!isLoaded) {
        injectButton(modal)
        getProblemDetails(modal)
        isLoaded = true
    }

}


