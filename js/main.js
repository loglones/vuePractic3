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

    }
})