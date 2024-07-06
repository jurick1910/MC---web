document.addEventListener('DOMContentLoaded', () => {
    // Menu toggle function
    let menuList = document.getElementById("menuList");
    menuList.style.maxHeight = "0px";

    function toggleMenu() {
        if (menuList.style.maxHeight == "0px") {
            menuList.style.maxHeight = "300px";
        } else {
            menuList.style.maxHeight = "0px";
        }
    }

    document.querySelector('.menu-icon i').addEventListener('click', toggleMenu);

    // Notes saving logic for dodatni simptomi
    document.getElementById('notesForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const notes = document.getElementById('notesTextarea').value;

        try {
            const response = await fetch('http://localhost:3000/save_dodatni_simptomi', {
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
});

