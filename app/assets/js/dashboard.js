// get user auth data
async function getAuthData() {
    const authData = await getLoggedData();

    // user is logged
    if (authData['isLogged']) {
        // show user data
        document.querySelector('#fullname').innerText = authData['userData']['fullname']
        document.querySelector('#email').innerText = authData['userData']['email']
    }
    // user not logged
    else {
        // try to delete token
        localStorage.removeItem('token')

        // redirect to sign in page
        window.location = './signin.html';
    }
}

getAuthData();

// declare logout click
document.querySelector('#logout').addEventListener('click', () => {
    // delete auth token
    localStorage.removeItem('token')

    // redirect to sign in page
    window.location = './signin.html';
})