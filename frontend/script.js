function welcome(){
    alert("Welcome to TraderOS AI!");
}
function calculateRisk() {

    let capital = Number(document.getElementById("capital").value);

    let risk = Number(document.getElementById("riskPercent").value);

    let riskAmount = capital * risk / 100;

    document.getElementById("result").innerHTML =
    "Maximum Risk = ₹" + riskAmount;

}
function calculatePosition() {

    let capital = Number(document.getElementById("capital2").value);
    let risk = Number(document.getElementById("risk2").value);
    let entry = Number(document.getElementById("entry").value);
    let stoploss = Number(document.getElementById("stoploss").value);

    let riskAmount = capital * risk / 100;
    let perShareRisk = entry - stoploss;

    if (perShareRisk <= 0) {
        document.getElementById("positionResult").innerHTML =
        "Stop Loss should be lower than Entry Price.";
        return;
    }

    let quantity = Math.floor(riskAmount / perShareRisk);

    document.getElementById("positionResult").innerHTML =
    "Recommended Quantity = " + quantity + " Shares";
}

function saveTrade() {

    let date = document.getElementById("date").value;
    let stock = document.getElementById("stock").value;
    let entry = document.getElementById("entryPrice").value;
    let stop = document.getElementById("stopLoss").value;
    let target = document.getElementById("target").value;
    let emotion = document.getElementById("emotion").value;
    let notes = document.getElementById("notes").value;

    document.getElementById("tradeOutput").innerHTML = `
        <h3>Trade Saved ✅</h3>
        <p><b>Date:</b> ${date}</p>
        <p><b>Stock:</b> ${stock}</p>
        <p><b>Entry:</b> ₹${entry}</p>
        <p><b>Stop Loss:</b> ₹${stop}</p>
        <p><b>Target:</b> ₹${target}</p>
        <p><b>Emotion:</b> ${emotion}</p>
        <p><b>Notes:</b> ${notes}</p>
    `;
}

// Open Login Modal
function openLogin() {
    document.getElementById("loginModal").style.display = "block";
}

// Close Login Modal
function closeLogin() {
    document.getElementById("loginModal").style.display = "none";
}

// Login Button
function loginUser() {

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    if (email === "" || password === "") {
        alert("Please fill all fields.");
        return;
    }

    alert("Login Successful!");

    closeLogin();
}

function openRegister(){
    document.getElementById("registerPopup").
    style.display="flex";
}

function closeRegister(){

    document.getElementById("registerPopup").
    style.display="none";
}

function registerUser() {

    let name = document.getElementById("registerName").value;
    let email = document.getElementById("registerEmail").value;
    let password = document.getElementById("registerPassword").value;
    let confirmPassword = document.getElementById("confirmPassword").value;

    if(name === "" || email === "" || password === "" || confirmPassword === ""){
        alert("Please fill all fields");
        return;
    }

    if(password !== confirmPassword){
        alert("Passwords do not match");
        return;
    }

    let user = {
        name: name,
        email: email,
        password: password
    };

    localStorage.setItem("traderUser", JSON.stringify(user));

    alert("Registration Successful!");

    closeRegister();
}

function loginUser() {

    let email = document.getElementById("loginEmail").value;
    let password = document.getElementById("loginPassword").value;

    let user = JSON.parse(localStorage.getItem("traderUser"));

    if (
        email === user.email &&
        password === user.password
    ) {

        alert("Login Successful!");
           window.location.href="dashboard.html"
        closeLogin();

        document.getElementById("loginBtn").style.display = "none";
        document.getElementById("registerBtn").style.display = "none";

        document.getElementById("welcomeUser").style.display = "inline";
        document.getElementById("logoutBtn").style.display = "inline";

        document.getElementById("welcomeUser").innerHTML =
        "👋 Welcome " + user.name;

    } else {

        alert("Invalid Email or Password");

    }
}

function logoutUser() {

    document.getElementById("loginBtn").style.display = "inline-block";
    document.getElementById("registerBtn").style.display = "inline-block";

    document.getElementById("welcomeUser").style.display = "none";
    document.getElementById("logoutBtn").style.display = "none";

    alert("Logged Out Successfully");
}