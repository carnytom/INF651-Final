

function createElemWithText(elemType = "p", elemText = "", elemClass) {
    let elem = document.createElement(elemType);
    elem.textContent = elemText;
    if (elemClass) {
        elem.classList.add(elemClass);
    }
    return elem;
}

function createSelectOptions(userData) {
    if (!userData) {
        return;
    }
    let options = [];
    for (user of userData) {
        let option = document.createElement("option");
        option.value = user.id;
        option.textContent = user.name;
        options.push(option);
    }
    return options;
}

function toggleCommentSection(postId) {
    if (!postId) {
        return;
    }
    let sectionToToggle = document.querySelector(`section[data-post-id="${postId}"]`);
    if (!sectionToToggle) {
        return null;
    } 
    sectionToToggle.classList.toggle('hide');

    return sectionToToggle;
}

function toggleCommentButton(postId) {
    if (!postId) {
        return;
    }
    let buttonToToggle = document.querySelector(`button[data-post-id="${postId}"]`);
    if (!buttonToToggle) {
        return null;
    } 
    buttonToToggle.textContent = ((buttonToToggle.textContent == 'Show Comments') 
        ? buttonToToggle.textContent = 'Hide Comments' : buttonToToggle.textContent = 'Show Comments');
    return buttonToToggle;
}

function deleteChildElements(parent) {
    if ((!parent) || !(parent instanceof HTMLElement)) {
        return;
    }
    let child = parent.lastElementChild;
    while (child) {
        parent.removeChild(child);
        child = parent.lastElementChild;
    }
    return parent;
}

function addButtonListeners() {
    buttons = document.querySelectorAll("main button");
    for (button of buttons) {
        let postId = button.dataset.postId;
        button.addEventListener("click", (e) => {
            toggleComments(e, postId);
        });
    }
    return buttons;
}

function toggleComments(e, postId) {
    if (!e && !postId) {
        return;
    }
    e.target.listener = true;
    let result = [];
    result.push(toggleCommentSection(postId));
    result.push(toggleCommentButton(postId));
    return result;
}

function removeButtonListeners() {
    buttons = document.querySelectorAll("main button");
    for (button of buttons) {
        let postId = button.dataset.postId;
        button.removeEventListener("click", (e) => {
            toggleComments(e, postId);
        });
    }
    return buttons;
}

function createComments(comments) {
    if (!comments) {
        return;
    }
    fragment = document.createDocumentFragment();
    for (comment of comments) {
        let article = document.createElement("article");
        let h3 = createElemWithText('h3', comment.name);
        let pBody = createElemWithText('p', comment.body);
        let pFrom = createElemWithText('p', `From: ${comment.email}`);
        article.appendChild(h3);
        article.appendChild(pBody);
        article.appendChild(pFrom);
        fragment.appendChild(article);
    }
    return fragment;
}

function populateSelectMenu(users) {
    if (!users) {
        return;
    }
    let options = createSelectOptions(users);
    for (option of options) {
        document.getElementById("selectMenu").appendChild(option);
    }
    return document.getElementById("selectMenu");
}

async function getUsers() {
    try {
        let users = await fetch("https://jsonplaceholder.typicode.com/users");
        return users.json();
    } catch (error) {
        console.error(error);
    }
}

async function getUserPosts(userId) {
    if (!userId) {
        return;
    }
    try {
        let userPosts = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
        return userPosts.json();
    } catch (error) {
        console.error(error);
    }
}

async function getUser(userId) {
    if (!userId) {
        return;
    }
    try {
        let userData = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
        return userData.json();
    } catch (error) {
        console.error(error);
    }
}

async function getPostComments(postId) {
    if (!postId) {
        return;
    }
    try {
        const comments =  await fetch (`https://jsonplaceholder.typicode.com/posts/${postId}/comments`)
        return comments.json();
    } catch (error) {
        console.error(error);
    }
}

async function displayComments(postId) {
    if (!postId) {
        return;
    }
    let section = document.createElement("section");
    section.dataset.postId = postId;
    section.classList.add('comments');
    section.classList.add('hide');
    let comments = await getPostComments(postId);
    let fragment = createComments(comments);
    section.appendChild(fragment);
    return section;
}

async function createPosts(posts) {
    if (!posts) {
        return;
    }
    let fragment = document.createDocumentFragment();
    for (post of posts) {
        let article = document.createElement("article");
        let h2 = createElemWithText('h2', post.title);
        let pBody = createElemWithText('p', post.body);
        let pId = createElemWithText('p', `Post ID: ${post.id}`);
        let author = await getUser(post.userId);
        let pAuth = createElemWithText('p', `Author: ${author.name} with ${author.company.name}`);
        let pPhrase = createElemWithText('p', `${author.company.catchPhrase}`);
        let button = createElemWithText('button', "Show Comments");
        button.dataset.postId = post.id;
        article.appendChild(h2);
        article.appendChild(pBody);
        article.appendChild(pId);
        article.appendChild(pAuth);
        article.appendChild(pPhrase);
        article.appendChild(button);
        let section = await displayComments(post.id);
        article.appendChild(section);
        fragment.appendChild(article);
    }
    return fragment;
}

async function displayPosts(posts) {
    let main = document.querySelector("main");
    let element = (!posts) ? createElemWithText('p', 'Select an Employee to display their posts.', "default-text") : await createPosts(posts);
    main.appendChild(element);
    return element;
}

async function refreshPosts(posts) {
    if (!posts) {
        return;
    }
    let result = [];
    result.push(removeButtonListeners());
    result.push(deleteChildElements((document.querySelector("main"))));
    result.push(await displayPosts(posts));
    result.push(addButtonListeners());
    return result;
}

async function selectMenuChangeEventHandler(e) {
    if (!e) {
        return;
    }
    console.log(e);
    console.log(e.target);
    console.log(e.target.value);
    let selector = e.target;
    selector.disabled = true;
    let result = [];
    let userId = selector.value || 1;
    result.push(userId);
    let posts = await getUserPosts(userId);
    result.push(posts);
    result.push( await refreshPosts(posts));
    console.log("result " + result);
    selector.disabled = false;
    return result;
}

async function initPage() {
    let result = [];
    let users = await getUsers();
    result.push(users);
    result.push(await populateSelectMenu(users));
    return result;
}

function initApp() {
    initPage();
    let select = document.getElementById("selectMenu");
    select.addEventListener("change" , selectMenuChangeEventHandler, false);
}
document.addEventListener('DOMContentLoaded' , () => {
    initApp();
});