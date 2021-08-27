var completed = [], pending = [];
var firebaseConfig = {};

$(document).ready(function () {
    chrome.runtime.sendMessage({
        msg: "get_config"
    }, (response) => {
        firebaseConfig = response;
        init();
    });

    async function init() {
        firebase.initializeApp(firebaseConfig);
        firebase.analytics();
        var ui = new firebaseui.auth.AuthUI(firebase.auth());
        const firebaseAuth = new Promise((resolve) => {
            firebase.auth().onAuthStateChanged(function (user) {
                if (user) {
                    $('#name_head').text(`${user.displayName}'s Tasks`);
                    $("#signout").show();
                    $("#main").show();
                    $("#top").show();
                    $("#signout").click(function () {
                        firebase.auth().signOut();
                        $("#signout").hide();
                        $('#name_head').text(`Your Tasks`);
                        pending = [];
                        completed = [];
                        $("#main").hide();
                        $("#top").hide();
                        refreshTasks();
                    });
                    console.log("State Changed");
                    resolve(true);
                }
                else {
                    $("#main").hide();
                    $("#top").hide();
                    ui.start('#firebaseui-auth-container', {
                        signInOptions: [
                            {
                                provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                                customParameters: {
                                    prompt: 'select_account'
                                }
                            },
                            firebase.auth.EmailAuthProvider.PROVIDER_ID
                        ],
                        signInFlow: 'popup',
                        signInSuccessUrl: '#',
                        callbacks: {
                            signInSuccessWithAuthResult: function (authResult, redirectUrl) {
                                $('#name_head').text(`${authResult.displayName}'s Tasks`);
                                resolve(true);
                                return false;
                            }
                        }
                    });
                }
            });
        });

        await firebaseAuth;

        fetchData();
    }

    function refreshBindings() {
        $('.complete_btn').click(async function () {
            //move task to completed
            let text = $(this).siblings('.task').text();
            let index = pending.indexOf(text);
            completed.push(text);
            pending.splice(index, 1);
            // window.localStorage.setItem('pending_tasks', JSON.stringify(pending));
            // window.localStorage.setItem('completed_tasks', JSON.stringify(completed));
            //show loader
            await syncData();
            //hide loader
            refreshTasks();
        });

        $('.delete_btn_completed').click(async function () {
            //delete task from completed
            let text = $(this).siblings('.task').text();
            let index = completed.indexOf(text);
            
            completed.splice(index, 1);
            // window.localStorage.setItem('completed_tasks', JSON.stringify(completed));
            //show loader
            await syncData();
            //hide loader
            refreshTasks();
        });

        $('.delete_btn_pending').click(async function () {
            //delete task from pending
            let text = $(this).siblings('.task').text();
            let index = pending.indexOf(text);
            pending.splice(index, 1);
            // window.localStorage.setItem('pending_tasks', JSON.stringify(pending));
            //show loader
            await syncData();
            //hide loader
            refreshTasks();
        });
    }

    function refreshTasks() {
        // if (!window.localStorage.getItem('pending_tasks')) {
        //     window.localStorage.setItem('pending_tasks', JSON.stringify(pending));
        // }

        // if (!window.localStorage.getItem('completed_tasks')) {
        //     window.localStorage.setItem('completed_tasks', JSON.stringify(completed));
        // }

        // pending = JSON.parse(window.localStorage.getItem('pending_tasks'));
        // completed = JSON.parse(window.localStorage.getItem('completed_tasks'));

        $('#list').html('');
        $('#completed_list').html('');

        $('#list').append(`<h2 class="sticky bg-black">Pending Tasks :- </h2>`);
        $('#completed_list').append(`<h2 class="sticky bg-dark">Completed Tasks :- </h2>`);

        for (let i = 0; i < pending.length; i++) {
            $('#list').append(`<div><span class="task">${pending[i]}</span><button class="complete_btn">&#10003;
            </button><button class="delete_btn_pending">&times;</button></div>`);
        }

        for (let i = 0; i < completed.length; i++) {
            $('#completed_list').append(`<div><span class="task">${completed[i]}</span><button class="delete_btn_completed">&times;</button></div>`);
        }

        refreshBindings();
    }

    refreshTasks();

    $("#add_btn").click(async () => {
        //add a new task to list
        var task = $('#task_val').val();
        if (task == "") {
            return;
        }
        pending.push(task);
        // window.localStorage.setItem('pending_tasks', JSON.stringify(pending));
        //show loader
        await syncData();
        //hide loader
        $('#task_val').val('');
        refreshTasks();
    });

    async function fetchData() {
        console.log("Fetch Data");
        var database = firebase.database();
        var ref = database.ref('Task/' + firebase.auth().currentUser.uid);
        //show loader
        ref.get().then((snapshot) => {
            if (snapshot.exists()) {
                var tasks = snapshot.val();
                console.log("All tasks = ",tasks);
                for(let i = 0; i < tasks.length; i++) {
                    let task = tasks[i];
                    if(task['isChecked'] == 0 || task['isChecked'] == "0") {
                        pending.push(task['title']);
                    }
                    else {
                        completed.push(task['title']);
                    }
                }
                console.log("Pending Tasks = ", pending);
                console.log("Completed Tasks = ", completed);
            } else {
                console.log("No data available");
            }
            //hide loader
            refreshTasks();
        });
    }

    async function syncData() {
        var database = firebase.database();
        var ref = database.ref('Task/' + firebase.auth().currentUser.uid);
        await ref.remove();
        for (let i = 0; i < pending.length; i++) {
            ref.child(i).set({ 'title': pending[i], "isChecked" : 0 });
        }
        for (let i = 0; i < completed.length; i++) {
            ref.child(i+pending.length).set({ 'title': completed[i], "isChecked" : 1 });
        }
        return true;
    }
});