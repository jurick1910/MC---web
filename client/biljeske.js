document.getElementById('notesForm').addEventListener('submit', async (event) => {
    function toggleMenu() {
        if (menuList.style.maxHeight == "0px") {
            menuList.style.maxHeight = "300px";
        } else {
            menuList.style.maxHeight = "0px";
        }
    }

    document.querySelector('.menu-icon i').addEventListener('click', toggleMenu);

    event.preventDefault();
    const notes = document.getElementById('notesTextarea').value;

    try {
        const response = await fetch('/save_notes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ notes })
        });
 
    } catch (error) {
        console.error('Error:', error);
        alert('Error saving notes');
    }
});

