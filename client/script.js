document.addEventListener('DOMContentLoaded', () => {
    const monthYearDisplay = document.getElementById('month-year');
    const daysGrid = document.getElementById('days-grid');
    const prevMntBtn = document.getElementById('prev-month');
    const nextMntBtn = document.getElementById('next-month');
    const periodInfo = document.getElementById('period-info');

    const periods = [];

    let currentDate = new Date();
    let psStartDate = null;
    let psEndDate = null;
    
    class Period {
        constructor(startDate, endDate) {
            this.startDate = startDate;
            this.endDate = endDate;
        }
    }

    function updateCal() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const fstDay = new Date(year, month, 1).getDay();
        const lstDate = new Date(year, month + 1, 0).getDate();

        monthYearDisplay.textContent = currentDate.toLocaleDateString('hr-hr', { month: 'long', year: 'numeric' });

        daysGrid.innerHTML = '';

        for (let i = 0; i < fstDay; i++) {
            daysGrid.appendChild(document.createElement('span'));
        }

        for (let date = 1; date <= lstDate; date++) {
            const dayelem = document.createElement('span');
            dayelem.textContent = date;
            const fullDate = new Date(year, month, date).toISOString().split('T')[0];

            if (psStartDate && psEndDate) {
                const startDate = new Date(psStartDate);
                const endDate = new Date(psEndDate);
                const currentDay = new Date(year, month, date);
                if (currentDay >= startDate && currentDay <= endDate) {
                    dayelem.classList.add('start-period');
                }
            } else if (psStartDate && new Date(psStartDate).toISOString().split('T')[0] === fullDate) {
                dayelem.classList.add('start-period');
            }

            dayelem.addEventListener('click', () => {
                if (!psStartDate || (psStartDate && psEndDate)) {
                    psStartDate = new Date(year, month, date + 1).toISOString().split('T')[0];
                    psEndDate = null;
                    resetColors();
                    dayelem.classList.add('start-period');
                } else if (psStartDate && !psEndDate) {
                    psEndDate = new Date(year, month, date + 1).toISOString().split('T')[0];
                    if (new Date(psEndDate) < new Date(psStartDate)) {
                        [psStartDate , psEndDate] = [psEndDate, psStartDate];
                    }
                    const period = new Period(psStartDate, psEndDate);
                    periods.push(period);
                    highlightPs();
                    highlightLstDay();
                }
                updatePeriodInfo();
            });

            daysGrid.appendChild(dayelem);
        }
        
    }

    function highlightLstDay() {
        const lstDay = new Date(new Date(psStartDate).setDate(new Date(psEndDate).getDate() - new Date(psStartDate).getDate() + 1));
        const lastdayelem = document.querySelector(`.day[data-date="${lstDay.toISOString().split('T')[0]}"]`);
        if (lastdayelem) {
            lastdayelem.classList.add('period-end');
        }
    }

    function resetColors() {
        daysGrid.querySelectorAll('span').forEach(day => {
            day.classList.remove('start-period', 'end-period');
        });
    }

    function highlightPs() {
        resetColors();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const startDate = new Date(psStartDate);
        const endDate = new Date(psEndDate);
        for (let date = startDate.getDate(); date <= endDate.getDate(); date++) {
            const dayelem = daysGrid.querySelector(`span:nth-child(${date + new Date(year, month, 1).getDay()})`);
            if (dayelem) {
                dayelem.classList.add('start-period');
            }
        }
    }

    function calcNextPs(cycleDays) {
        if (psEndDate) {
            const nextPsStartDate = new Date(new Date(psEndDate).setDate(new Date(psEndDate).getDate() + cycleDays)).toLocaleDateString('hr-hr');
            return nextPsStartDate;
        }
        return null;
    }

    function updatePeriodInfo() {
        let periodInfoText = '';
        if (psStartDate && psEndDate) {
            const startDate = new Date(psStartDate).toLocaleDateString('hr-hr');
            const endDate = new Date(psEndDate).toLocaleDateString('hr-hr');
            periodInfoText += `Posljednja menstruacija: ${startDate} do ${endDate}<br>`;

            const nextPs28 = calcNextPs(28);
            const nextPs30 = calcNextPs(30);
            periodInfoText += `Sljedeća menstruacija : ${nextPs28} ili ${nextPs30}<br>`;
        } else if (psStartDate) {
            const startDate = new Date(psStartDate).toLocaleDateString('hr-hr');
            periodInfoText += `Početak menstruacije: ${startDate}<br>`;
        } else {
            periodInfoText += '';
        }

        periods.forEach((period, index) => {
            const psStartDate = new Date(period.startDate).toLocaleDateString('hr-hr');
            const psEndDate = new Date(period.endDate).toLocaleDateString('hr-hr');
            periodInfoText += `Period ${index + 1}: ${psStartDate} do ${psEndDate}<br>`;
        });

        periodInfo.innerHTML = periodInfoText;
    }
    
    prevMntBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateCal();
    });

    nextMntBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateCal();
    });

    updateCal();


    let menuList = document.getElementById("menuList");
    let menuIcon = document.querySelector(".menu-icon");

    function toggleMenu() {
        if (menuList.style.maxHeight === "0px" || menuList.style.maxHeight === "") {
            menuList.style.maxHeight = "200px"; // Adjust height as needed
        } else {
            menuList.style.maxHeight = "0px";
        }
    }

    // Event listener for menu icon click
    menuIcon.addEventListener('click', toggleMenu);

});


const symptomCircles = document.querySelectorAll('.symptom-circle');

symptomCircles.forEach(symptomCircle => {
    symptomCircle.addEventListener('click', () => {
        symptomCircle.classList.toggle('selected');
    });
});

// Function to collect selected symptoms and submit to backend
function submitSymptoms() {
    const selectedSymptoms = [];
    symptomCircles.forEach(symptomCircle => {
        if (symptomCircle.classList.contains('selected')) {
            selectedSymptoms.push(symptomCircle.nextElementSibling.textContent);
        }
    });

    // Prepare data for submission
    const formData = {
        symptoms: selectedSymptoms
    };

    // POST request to send data to backend
    fetch('/save_symptoms', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Symptoms saved:', data);
        // Optionally handle success or display a message
    })
    .catch(error => {
        console.error('Error saving symptoms:', error);
        // Handle error
    });
}

// Event listener for form submission
const symptomForm = document.getElementById('symptomForm');
symptomForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission
    submitSymptoms();
});


/*let menuList = document.getElementById("menuList")
        menuList.style.maxHeight = "0px";

        function toggleMenu(){
            if(menuList.style.maxHeight == "0px")
            {
                menuList.style.maxHeight = "300px";
            }
            else{
                menuList.style.maxHeight = "0px";
            }
        }*/


