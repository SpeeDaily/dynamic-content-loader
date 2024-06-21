async function fetchContent() {
    try {
        const response = await fetch('content.json');
        const contentData = await response.json();
        loadRecommendations(contentData);
    } catch (error) {
        console.error('Error fetching content:', error);
    }
}

function loadRecommendations(contentData) {
    let clicks = JSON.parse(localStorage.getItem('clicks')) || [];
    let recommendations = [];

    if (clicks.length > 0) {
        recommendations = generateRecommendations(contentData, clicks);
    } else {
        recommendations = shuffleArray(contentData);
    }

    displayRecommendations(recommendations);
}

function generateRecommendations(contentData, clicks) {
    const labelCounts = {};
    const userInterests = new Set();

    // Update label counts based on user clicks
    clicks.forEach(click => {
        click.labels.forEach(label => {
            userInterests.add(label);
            labelCounts[label] = labelCounts[label] ? labelCounts[label] + 1 : 1;
        });
    });

    const sortedLabels = Object.keys(labelCounts).sort((a, b) => labelCounts[b] - labelCounts[a]);

    let recommendedContent = [];
    let otherContent = [];

    // Categorize content into recommended and other based on user interests
    contentData.forEach(item => {
        const intersect = item.labels.filter(label => userInterests.has(label));
        if (intersect.length > 0) {
            recommendedContent.push(item);
        } else {
            otherContent.push(item);
        }
    });

    // Shuffle recommended content
    recommendedContent = shuffleArray(recommendedContent);

    // Mix recommended and other content
    const finalRecommendations = [];
    const maxLength = Math.max(recommendedContent.length, otherContent.length);
    for (let i = 0; i < maxLength; i++) {
        if (i < recommendedContent.length) {
            finalRecommendations.push(recommendedContent[i]);
        }
        if (i < otherContent.length) {
            finalRecommendations.push(otherContent[i]);
        }
    }

    return finalRecommendations;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function displayRecommendations(recommendations) {
    const contentContainer = document.getElementById('content-container');
    contentContainer.innerHTML = '';

    recommendations.forEach(item => {
        const contentItem = document.createElement('div');
        contentItem.className = 'content-item';
        contentItem.innerHTML = `<h2>${item.title}</h2><p>${item.description}</p><a href="${item.link}" target="_blank">Read more</a>`;
        contentContainer.appendChild(contentItem);
    });
}

document.addEventListener('DOMContentLoaded', fetchContent);
