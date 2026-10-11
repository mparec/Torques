let input_amount = document.getElementById("amount");
let get_amount = document.getElementById("send_amount");
let inputsContainer = document.getElementById("inputs_container");
let calculateBtn = document.getElementById("calculate");
let resultsDiv = document.getElementById("results");
let canvas = document.getElementById("vectorCanvas");
let ctx = canvas.getContext("2d");

function CreateVectorSystem(rx, ry, fx, fy) {
    this.dist_x = rx;
    this.dist_y = ry;
    this.force_x = fx;
    this.force_y = fy;
}

function GetModule(comp_x, comp_y) {
    return Math.sqrt(comp_x * comp_x + comp_y * comp_y);
}

get_amount.addEventListener("click", () => {
    let n = parseInt(input_amount.value);
    if (isNaN(n) || n <= 0) {
        window.alert("La cantidad de vectores debe ser mayor a cero: n > 0");
        input_amount.value = "";
        inputsContainer.innerHTML = "";
        calculateBtn.style.display = "none";
        resultsDiv.style.display = "none";
        canvas.style.display = "none";
        return;
    }

    inputsContainer.innerHTML = "";
    for (let i = 0; i < n; i++) {
        inputsContainer.innerHTML += `
            <div class="vector-box">
                <h4>Sistema Vectorial ${i + 1}</h4>
                <label>Distancia (posición r):</label><br>
                <input type="number" step="any" id="rx_${i}" placeholder="rx (Componente X)"><br>
                <input type="number" step="any" id="ry_${i}" placeholder="ry (Componente Y)"><br>
                
                <label>Fuerza (F):</label><br>
                <input type="number" step="any" id="fx_${i}" placeholder="Fx (Componente X)"><br>
                <input type="number" step="any" id="fy_${i}" placeholder="Fy (Componente Y)">
            </div>
        `;
    }
    calculateBtn.style.display = "block";
    resultsDiv.style.display = "none";
    canvas.style.display = "none";
});

// vibecode a partir de aqui XD

function drawArrow(ctx, fromX, fromY, toX, toY, color, label) {
    const headLength = 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(toX, toY);
    ctx.fill();

    if (label) {
        ctx.font = "12px 'gg sans', sans-serif";
        ctx.fillStyle = "#dbdee1";
        ctx.fillText(label, toX + 6, toY - 6);
    }
}

calculateBtn.addEventListener("click", () => {
    let n = parseInt(input_amount.value);
    let sistemas = [];
    let htmlResult = "<h3>Resultados:</h3>";
    let torqueTotalVectorial = 0;

    for (let i = 0; i < n; i++) {
        let rx = parseFloat(document.getElementById(`rx_${i}`).value) || 0;
        let ry = parseFloat(document.getElementById(`ry_${i}`).value) || 0;
        let fx = parseFloat(document.getElementById(`fx_${i}`).value) || 0;
        let fy = parseFloat(document.getElementById(`fy_${i}`).value) || 0;
        sistemas.push(new CreateVectorSystem(rx, ry, fx, fy));
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let cx = canvas.width / 2;
    let cy = canvas.height / 2;

    // Ejes cartesianos estilo Discord dark
    ctx.strokeStyle = "#3f4147";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, cy); ctx.lineTo(canvas.width, cy);
    ctx.moveTo(cx, 0); ctx.lineTo(cx, canvas.height);
    ctx.stroke();

    let maxVal = 1;
    sistemas.forEach(s => {
        maxVal = Math.max(maxVal, Math.abs(s.dist_x), Math.abs(s.dist_y), Math.abs(s.force_x), Math.abs(s.force_y));
    });
    let scale = (canvas.width / 2.5) / maxVal;

    sistemas.forEach((sistema, i) => {
        let torqueVectorial = (sistema.dist_x * sistema.force_y) - (sistema.dist_y * sistema.force_x);
        torqueTotalVectorial += torqueVectorial;

        let modR = GetModule(sistema.dist_x, sistema.dist_y);
        let modF = GetModule(sistema.force_x, sistema.force_y);

        let dotProduct = (sistema.dist_x * sistema.force_x) + (sistema.dist_y * sistema.force_y);
        let angleDeg = 0;
        if (modR > 0 && modF > 0) {
            let cosTheta = Math.max(-1, Math.min(1, dotProduct / (modR * modF)));
            angleDeg = Math.acos(cosTheta) * (180 / Math.PI);
        }

        let rCanvasX = cx + (sistema.dist_x * scale);
        let rCanvasY = cy - (sistema.dist_y * scale);
        let fCanvasX = rCanvasX + (sistema.force_x * scale);
        let fCanvasY = rCanvasY - (sistema.force_y * scale);

        // Colores brillantes adaptados a fondo oscuro
        let colors = ["#00b0f4", "#ed4245", "#57f287", "#fee75c", "#eb459e"];
        let color = colors[i % colors.length];

        drawArrow(ctx, cx, cy, rCanvasX, rCanvasY, color, `r${i+1}`);
        drawArrow(ctx, rCanvasX, rCanvasY, fCanvasX, fCanvasY, "#ffffff", `F${i+1}`);

        htmlResult += `
            <p><b>Sistema ${i + 1}:</b><br>
            - Torque Vectorial (&tau;): <b style="color:${color}">${torqueVectorial.toFixed(4)} N·m</b><br>
            - Módulo de Distancia (|r|): ${modR.toFixed(4)} m<br>
            - Módulo de Fuerza (|F|): ${modF.toFixed(4)} N<br>
            - Ángulo (&theta;): ${angleDeg.toFixed(2)}°</p>
            <hr>
        `;
    });

    htmlResult += `<h4>Torque Total Acumulado: ${torqueTotalVectorial.toFixed(4)} N·m</h4>`;

    resultsDiv.innerHTML = htmlResult;
    resultsDiv.style.display = "block";
    canvas.style.display = "block";
});