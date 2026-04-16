window.addEventListener("load", () =>{
    const dateInput = document.querySelector("#calendarDate");
    const newsContainer = document.querySelector("#newsContainer");
    const today = new Date();
    const todayISO = today.toISOString().split("T")[0];
   

    dateInput.max = todayISO;
    dateInput.addEventListener("change", async (event) => {
        if(!dateInput.value) return false;
        const selectedDate = new Date(dateInput.value);
        if(selectedDate >= today){
            newsContainer.textContent = "Selecciona un dia anterior a hoy para ver las noticias historicas de ese dia.";
            return false;
        }
        newsContainer.textContent = "Cargando noticias ...";

        //Consulta API ChatGpt
    });
    
});