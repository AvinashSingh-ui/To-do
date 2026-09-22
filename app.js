const input = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const ul = document.getElementById("taskList");
const deleteTask = (li) => {
    const deleteBtn = document.createElement("button");

    deleteBtn.textContent = "Delete Task";
    deleteBtn.className = "bg-red-500 p-2 ml-2 text-black rounded";

    deleteBtn.addEventListener("click", () => {
        li.remove();
    });

    li.appendChild(deleteBtn);
};

const editTask = (li) => {
    const editBtn = document.createElement("button");

    editBtn.textContent = "Edit Task";
    editBtn.className =
        "bg-yellow-500 p-2 ml-2 text-white rounded";

    editBtn.addEventListener("click", () => {

        const currentTask = li.firstChild.textContent;

        const newTask = prompt("Edit your task", currentTask);

        if (newTask !== null && newTask.trim() !== "") {
            li.firstChild.textContent = newTask;

            li.classList.remove("line-through");
            const existingCompleteBtn =
                li.querySelector(".complete-btn");
            if (!existingCompleteBtn) {
                const completeBtn = document.createElement("button");
                 completeBtn.textContent = "Mark Done";

                completeBtn.className =
                    "complete-btn ml-2 p-2 bg-green-500 text-white rounded";

                completeBtn.addEventListener("click", () => {
                    li.classList.add("line-through");
                    completeBtn.remove();
                });

                li.appendChild(completeBtn);
            }
        }
    });

    li.appendChild(editBtn);
};

const addTask = () => {

    const task = input.value.trim();

    if (task === "") {
        alert("Enter task first");
        return;
    }

    const li = document.createElement("li");

    li.textContent = task;

    li.className ="bg-gray-200 p-3 my-2 rounded-lg text-gray-800 text-3xl w-fit sm:text-base md:p-4";
    const completeBtn =
        document.createElement("button");

    completeBtn.textContent = "Mark Done";

    completeBtn.className = "complete-btn ml-2 p-2 bg-green-500 text-white rounded";

    completeBtn.addEventListener("click", () => {
        li.classList.add("line-through");
        completeBtn.remove();
    });


    li.appendChild(completeBtn);

    editTask(li);

    deleteTask(li);

    ul.appendChild(li);

    input.value = "";
};


addBtn.addEventListener("click", addTask);