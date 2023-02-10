
// declare sign up button
const buttonSignup = document.querySelector('#signup')

// declare form
const form = document.querySelector('#form-login')

// declare endpoint
const endpoint = 'http://localhost:3000/api/signup'

// get user auth data
async function getAuthData() {
    const authData = await getLoggedData();

    // user is logged
    if (authData['isLogged']) {
        // redirect to dashboard
        window.location = './dashboard.html';
    }
}

getAuthData();

// declare form submit
form.addEventListener('submit', async (event) => {
    event.preventDefault()

    // get full name
    const fullname = document.querySelector('#fullname').value

    // get email
    const email = document.querySelector('#email').value

    // get password
    const password = document.querySelector('#password').value

    // validate fields
    if (!fullname.length || !email.length || !password.length) {
        // show error
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'One or more fields are invalid',
        })
        return
    }

    // show loading
    Swal.fire({
        title: 'Please Wait!',
        html: `
            <p>Communicating with the server</p>
            <img src="./assets/images/loading.gif" width="100px"></img>
        `,
        allowOutsideClick: false,
        showConfirmButton: false,
    })

    // send request to server
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            fullname,
            email,
            password
        })
    })
    .then(async response => {
        // valid login
        if (response.ok) {
            // show alert to redirect to sign in page
            Swal.fire({
                icon: 'success',
                title: 'Perfect!',
                html: 'Account created successfully',
                confirmButtonText: 'Login Now'
            }).then(function() {
                window.location = './signin.html';
            });
        }
        // invalid login
        else {
            // get error from response
            const jsonResponse = await response.json()

            // show error
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: jsonResponse['error'],
                confirmButtonText: 'Close'
            })
        }
    })
    .catch(error => {
        // show error
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'There was a problem communicating with the server',
            confirmButtonText: 'Close'
        })
    });
})