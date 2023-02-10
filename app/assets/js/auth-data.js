/**
 * check whenever the user is logged-in or not
 * @return {boolean}
 */
async function getLoggedData() {
    // retrieve the token from local storage
    const token = localStorage.getItem('token')

    const res = {
        'isLogged': false,
        'userData': {}
    }

    // send request to server
    await fetch('http://localhost:3000/api/get-auth-data', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(async response => {
            // valid login
            if (response.ok) {
                // get json from response
                const jsonResponse = await response.json()
                res['isLogged'] = true
                res['userData'] = jsonResponse['userData']
                // return true
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

    return res
}