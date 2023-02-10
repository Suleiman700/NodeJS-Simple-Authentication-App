
// declare sign in button
const buttonSignin = document.querySelector('#signin')

// declare form
const form = document.querySelector('#form-login')

// declare endpoint
const endpoint = 'http://localhost:3000/api/signin'


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

    // get email
    const email = document.querySelector('#email').value

    // get password
    const password = document.querySelector('#password').value

    // // validate fields
    // if (!email.length || !password.length) {
    //     // show error
    //     Swal.fire({
    //         icon: 'error',
    //         title: 'Error!',
    //         text: 'One or more fields are invalid',
    //     })
    //     return
    // }

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
            email,
            password
        })
    })
    .then(async response => {
        // get json from response
        const jsonResponse = await response.json()

        // valid login
        if (response.ok) {
            // store token
            const token = jsonResponse['token']
            localStorage.setItem('token', token)

            // redirect to dashboard
            window.location = './dashboard.html';
        }
        // invalid login
        else {
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