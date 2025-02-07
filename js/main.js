Vue.component('kanban-column', {
    props: ['title', 'tasks'],
    template: `
    <div class="kanban-columns">
        <h2>{{ title }}</h2>
        <div class="task-form" v-if="title === 'Запланированные задачи'">  \\ ?
            <input type="text" placeholder="Заголовок задачи">
            <textarea placeholder="Описание задачи"></textarea>
            <input type="date" placeholder="Дэдлайн">
            <button>Добавить задачу</button>
        </div>
        <div v-if="tasks.length > 0">
            
        </div>
    </div>`,
    data() {
        return {
            newTask: {
                title: '',
                description: '',
                deadline: '',
            }
        }
    },
    methods: {
        submitTask() {
            if(!this.newTask.title || !this.newTask.description || !this.newTask.deadline) return;

            const task = {
                id: Date.now(),
                createdAt: new Date().toLocaleString(),
                lastEditedAt: new Date().toLocaleString(),
                ...this.newTask
            };
            this.$emit('add-task', task);
            this.newTask = {title: '', description: '', deadline: ''};
        },


    }
})

new Vue({
    el: '#app',
    data: {
        plannedTasks: [],
    },
    methods: {
        addTask() {
            this.plannedTasks.push(task);
        },
        deleteTask(index) {
            this.plannedTasks.splice(index, 1);
        },
        editTask(updatedTask,index) {
            this.plannedTasks[index] = updatedTask;
        },
        moveTask(index) {
            const movedTask = this.plannedTasks.splice(index, 1)[0];

        }
    }
})