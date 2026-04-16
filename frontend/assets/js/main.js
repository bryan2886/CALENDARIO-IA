window.addEventListener("load", () => {
    const dateInput = document.querySelector("#calendarDate");
    const newsContainer = document.querySelector("#newsContainer");
    const today = new Date();
    const todayISO = today.toISOString().split("T")[0];


    dateInput.max = todayISO;
    dateInput.addEventListener("change", async (event) => {
        if (!dateInput.value) return false;
        const selectedDate = new Date(dateInput.value);
        if (selectedDate >= today) {
            newsContainer.textContent = "Selecciona un dia anterior a hoy para ver las noticias historicas de ese dia.";
            return false;
        }
        loader(true);
        newsContainer.textContent = "Cargando noticias ...";

        try {
            const response = await fetch(`${API_URL}/calendar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    day: selectedDate.getDate(),
                    month: selectedDate.getMonth() + 1,
                    year: selectedDate.getFullYear()
                })
            });

            const data = await response.json();
            loader(false);
            newsContainer.textContent = data.text || "No se encontraron noticias para esta fecha.";

        } catch (error) {
            loader(false);
            console.error("Error al consultar la API de ChatGPT:", error);
            newsContainer.textContent = "Ocurrió un error al cargar las noticias. Por favor, intenta nuevamente.";

        }


    });

});

function loader(state) {

    if (state) {
        JsLoadingOverlay.show({
            'spinnerIcon': 'ball-atom',
            'overlayOpacity': 0.6,
            "spinnerColor": "#4D9657",
        });

    } else {
        JsLoadingOverlay.hide();

    }

}