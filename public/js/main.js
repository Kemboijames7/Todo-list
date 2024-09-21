document.addEventListener('DOMContentLoaded', () => {
    
    // Select all elements with the class 'progress-container'
    const progressBtn = document.querySelectorAll('.progress-container');
    
    // Attach event listener to each progress bar container
    progressBtn.forEach((element) => {
        
        element.addEventListener('click', progressItem);
    });

    const todos = new Set();  // Use a Set to store unique todos

const deleteBtn = document.querySelectorAll('.fa-trash');
const todoItems = document.querySelectorAll('.todo-text');
const loveLiked = document.querySelectorAll('.fa-thumbs-up');
const editButtons = document.querySelectorAll('.fa-edit');

const todosSet = new Set(JSON.parse(document.getElementById('existingTodos').value)); // Initialize Set with existing todos

const form = document.getElementById('submitForm');
const todoInput = document.getElementById('todoInput');
const notification = document.getElementById('notification');

form.addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent the form from submitting immediately

    const todoText = todoInput.value.trim();  // Get the value of the input

    if (todoText) {
        if (todosSet.has(todoText)) {
            notification.textContent = `You have already added the todo: "${todoText}".`;
            notification.classList.add('error');
            notification.classList.remove('success');
        } else {
            todosSet.add(todoText);  // Add the new todo to the Set
            notification.textContent = `Thank you for adding "${todoText}".`;
            notification.classList.add('success');
            notification.classList.remove('error');

            // Submit the form to the server after successful addition
            form.submit();  
        }
    }

    // Clear the input field after submission
    form.reset();

    // Remove the notification after 4 seconds
    setTimeout(() => {
        notification.textContent = '';
    }, 4000);
});



Array.from(deleteBtn).forEach((element) => {
    element.addEventListener('click', deleteItem);
});

Array.from(todoItems).forEach((element) => {
    element.addEventListener('click', toggleComplete);
});



Array.from(loveLiked).forEach((element) => {
    element.addEventListener('click', addLike);
});

Array.from(editButtons).forEach((element) => {
    element.addEventListener('click', editItem);
});
Array.from(booLike).forEach((element) => {
    element.addEventListener('click', addDis);
});
});



async function deleteItem(event) {
    event.stopPropagation();
    const itemText = this.parentNode.querySelector('.todo-text').innerText;
    try {
        const response = await fetch('deleteItem', {
            method: 'delete',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 'itemFromJS': itemText })
        });
        const data = await response.json();
        console.log(data);
        if (data === 'Todo Deleted') {
            // Remove the todo item from the DOM
            this.parentNode.remove();
        }

    } catch (err) {
        console.log(err);
    }
}

async function addLike (event) {
    event.stopPropagation();
    const itemText = this.parentNode.querySelector('.todo-text').innerText;
    const tLikes = Number(this.innerText);
    try {
        const response = await fetch('likedItem', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 'itemFromJS': itemText, 'likesS': tLikes })
        });
        const data = await response.json();
        console.log(data);
        if (response.ok) {
            this.innerText = tLikes + 1;
        } else {
            console.error('Failed to update likes.');
        }
    } catch (err) {
        console.log(err);
    }
}


async function addDis (event) {
    event.stopPropagation();
    const itemText = this.parentNode.querySelector('.todo-text').innerText;
    const dLikes = Number(this.innerText);
    try {
        const response = await fetch('disItem', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 'itemFromJS': itemText })
        });
        const data = await response.json();
        console.log(data);
             // Only update the UI if the request was successful
             if (response.ok) {
                this.innerText = dLikes + 1;
            } else {
                console.error('Failed to update dislikes.');
            }
        } catch (err) {
            console.error('Error:', err);
        }
    }
      

async function toggleComplete(event) {
    event.stopPropagation();
    const itemId = this.getAttribute('data-id');
    console.log('Item ID:', itemId); // Debugging line

    if (!itemId) {
        console.error('No item ID found.');
        return;
    }

    const isCompleted = this.classList.contains('completed');
    
    try {
        const response = await fetch('/toggleComplete', {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 'itemId': itemId, 'completed': !isCompleted })
        });
        const data = await response.json();
        console.log(data);

        // Update the UI
        if (data.completed) {
            this.classList.add('completed');
        } else {
            this.classList.remove('completed');
        }
    } catch (err) {
        console.log(err);
    }
}
 

async function editItem(event) {
    const itemId = this.getAttribute('data-id');
    const newTodoText = prompt('Edit your todo item:');
    
    if (newTodoText) {
        try {
            const response = await fetch('/updateTodo', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    'id': itemId,
                    'newText': newTodoText
                })
            });
            if (response.ok) {
                const data = await response.json();
                console.log('Server response:', data);
                location.reload();  // Reload to reflect changes
            } else {
                const errorText = await response.text();
                console.error('Failed to update todo:', errorText);
            }
        } catch (err) {
            console.error('Error in update request:', err);
        }
    }
}



async function progressItem(event) {
    event.stopPropagation();
   
 // Get the progress from data attribute
 let currentProgress = parseInt(this.getAttribute('data-progress'), 10) || 0;
    // Correct ternary operator usage
    currentProgress = currentProgress < 100 ? currentProgress + 20 : 0;
     
    // Update progress bar
    const progressBar = this.querySelector('.progress');
    

    progressBar.style.width = currentProgress + '%';
    progressBar.textContent = currentProgress + '%';
    
    // Update the progress text
    const progressText = this.nextElementSibling;
    if (progressText) {
        progressText.textContent = currentProgress;
    }

    // Get the item ID from data-id attribute
    const itemId = this.getAttribute('data-id');
    


    try {
        const response = await fetch(`/update-progress/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ progress: currentProgress })
        });
    
        const result = await response.json();
    if (response.ok) {
        console.log('Progress updated successfully:', result);
    } else {
        console.error('Error updating progress:', result.message);
    }
} catch (error) {
    console.error('Error updating progress:', error);
}
} 

