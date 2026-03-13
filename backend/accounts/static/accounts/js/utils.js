function getCookie(name) {
    let cookieValue = null;

    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


// JSON API
export async function apiPost(url, data) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken")
        },
        body: JSON.stringify(data)
    });

    let result;

    try {
        result = await response.json();
    } catch {
        result = {message: "Server error"};
    }

    if (!response.ok) {
        throw result;
    }

    return result
}


// Django forms
export async function apiPostForm(url, formData) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "X-CSRFToken": getCookie("csrftoken")
        },
        body: formData
    });

    let data;
    try {
        data = await response.json();
    } catch {
        throw new Error("Invalid JSON response");
    }

    if (!response.ok && response.status === 400) {
        return data; // повертаємо JSON з помилками
    }

    if (!response.ok) {
        throw new Error("Request failed");
    }

    return data;
}
