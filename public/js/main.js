const deleteBtn = document.querySelectorAll('.fa-trash');
const todoItems = document.querySelectorAll('.todo-text');
const loveLiked = document.querySelectorAll('.fa-thumbs-up');
const editButtons = document.querySelectorAll('.fa-edit');
const booLike = document.querySelectorAll('.fa-thumbs-down');



Array.from(deleteBtn).forEach((element) => {
    element.addEventListener('click', deleteItem);
});

Array.from(todoItems).forEach((element) => {
    element.addEventListener('click', toggleComplete);
});
// Array.from(item).forEach((element) => {
//     element.addEventListener('click', markComplete);
// });

Array.from(loveLiked).forEach((element) => {
    element.addEventListener('click', addLike);
});

Array.from(editButtons).forEach((element) => {
    element.addEventListener('click', editItem);
});
Array.from(booLike).forEach((element) => {
    element.addEventListener('click', addDis);
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