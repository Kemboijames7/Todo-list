const deleteBtn = document.querySelectorAll('.fa-trash');
const item = document.querySelectorAll('.item .fa-check-square-o', '.item .fa-square-o');
const loveLiked = document.querySelectorAll('.fa-thumbs-up');

Array.from(deleteBtn).forEach((element) => {
    element.addEventListener('click', deleteItem);
});

Array.from(item).forEach((element) => {
    element.addEventListener('click', markComplete);
});

Array.from(loveLiked).forEach((element) => {
    element.addEventListener('click', addLike);
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
        location.reload();
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
    const itemId = this.dataset.id;
    const isCompleted = this.classList.contains('fa-check-square-o');
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

        if (!isCompleted) {
            this.classList.remove('fa-square-o');
            this.classList.add('fa-check-square-o', 'green');
        } else {
            this.classList.remove('fa-check-square-o', 'green');
            this.classList.add('fa-square-o');
        }

    } catch (err) {
        console.log(err);
    }
}
