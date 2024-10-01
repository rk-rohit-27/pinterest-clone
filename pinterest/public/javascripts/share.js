function copyLink() {
    // Copy link to clipboard
    const copyText = document.createElement("textarea");
    copyText.value = window.location.href;
    document.body.appendChild(copyText);
    copyText.select();
    document.execCommand("copy");
    document.body.removeChild(copyText);
    alert("Link copied to clipboard");
}

function shareOnFacebook() {
    // Construct Facebook share URL with the current page link
    const url = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(window.location.href);
    window.open(url, "_blank", "width=600,height=400");
}

function shareOnInstagram() {
    // Note: Instagram sharing from a browser is limited, typically requires app support
    alert("Instagram sharing is currently only available via the app.");
}

function shareOnTwitter() {
    // Construct Twitter share URL with the current page link
    const url = "https://twitter.com/intent/tweet?url=" + encodeURIComponent(window.location.href);
    window.open(url, "_blank", "width=600,height=400");
}

// Example usage of sharing a message
function shareWithMessage(platform, message) {
    let url;
    switch (platform) {
        case 'facebook':
            url = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(window.location.href);
            break;
        case 'twitter':
            url = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(message) + "&url=" + encodeURIComponent(window.location.href);
            break;
        default:
            alert("Sharing on this platform is not supported.");
            return;
    }
    window.open(url, "_blank", "width=600,height=400");
}


