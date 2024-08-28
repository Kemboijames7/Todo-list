const deleteBtn = document.querySelectorAll('.fa-trash');
const item = document.querySelectorAll('.item span');
const itemCompleted = document.querySelectorAll('.item span.completed');
const loveLiked = document.querySelectorAll('.fa-thumbs-up');
const editButtons = document.querySelectorAll('.fa-edit');



Array.from(deleteBtn).forEach((element) => {
    element.addEventListener('click', deleteItem);
});

Array.from(item).forEach((element) => {
    element.addEventListener('click', markComplete);
});
Array.from(itemCompleted).forEach((element) => {
    element.addEventListener('click', markUnComplete);
});

Array.from(loveLiked).forEach((element) => {
    element.addEventListener('click', addLike);
});

Array.from(editButtons).forEach((element) => {
    element.addEventListener('click', editItem);
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

async function addLike(event) {
    event.stopPropagation();
    const itemText = this.parentNode.querySelector('.todo-text').innerText;
    const tLikes = Number(this.innerText);
    try {
        const response = await fetch('likedItem', {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 'itemFromJS': itemText, 'likesS': tLikes })
        });
        const data = await response.json();
        console.log(data);
        this.innerText = tLikes + 1;
    } catch (err) {
        console.log(err);
    }
}


async function markComplete(event) {
    event.stopPropagation();
    const itemText = this.parentNode.querySelector('.todo-text').innerText;
    console.log(itemText)
    try {
        const response = await fetch('markComplete', {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 'itemFromJS': itemText })
        });
        const data = await response.json();
        console.log(data);
        location.reload();
    } catch (err) {
        console.log(err);
    }
}
async function markUnComplete(event) {
    event.stopPropagation();
    const itemText = this.parentNode.querySelector('.todo-text').innerText;
    try {
        const response = await fetch('markComplete', {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 'itemFromJS': itemText })
        });
        const data = await response.json();
        console.log(data);
        location.reload();
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