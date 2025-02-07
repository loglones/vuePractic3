Vue.component('kanban-column', {
    props: ['title', 'tasks'],
    template: `
    <div class="kanban-columns">
        <h2>{{ title }}</h2>
        <div class="task-form" v-if="title === 'Запланированные задачи'">
            <input type="text" placeholder="Заголовок задачи" v-model="newTask.title" @keyup.enter="submitTask" />
            <textarea placeholder="Описание задачи" v-model="newTask.description" @keyup.enter="submitTask"></textarea>
            <input type="date" placeholder="Дэдлайн" v-model="newTask.deadline" @keyup.enter="submitTask" />
            <button @click="submitTask">Добавить задачу</button>
        </div>
        <div v-if="tasks.length > 0">
             <task-card 
                    v-for="(task, index) in tasks" 
                    :key="task.id" 
                    :task="task" 
                    @delete="$emit('delete-task', title, index)" 
                    @edit="$emit('edit-task', title, $event, index)" 
                    @move="$emit('move-task', title, index)">
             </task-card>
        </div>
        <p v-else>Задач нет</p>
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
            if (!this.newTask.title || !this.newTask.description || !this.newTask.deadline) return;
            const task = {
                id: Date.now(),
                createdAt: new Date().toLocaleString(),
                lastEditedAt: new Date().toLocaleString(),
                ...this.newTask,
                isEditing: false
            };
            console.log('Добавлена новая задача:', task);
            this.$emit('add-task', task);
            this.newTask = { title: '', description: '', deadline: '' };
        }
    }
});

Vue.component('task-card', {
    props: ['task'],
    template: `
    <div class="task-card">
        <template v-if="!task.isEditing">
            <h3>{{ task.title }}</h3>
            <p><strong>Описание:</strong> {{ task.description }}</p>
            <p><strong>Дэдлайн:</strong> {{ task.deadline }}</p>
            <p><strong>Создана:</strong> {{ task.createdAt }}</p>
            <p><strong>Последнее изменение:</strong> {{ task.lastEdited }}</p>
            <div class="actions">
                <button class="edit-btn" @click="startEdit">Редактировать</button>
                <button class="delete-btn" @click="$emit('delete')">Удалить</button>
                <button class="move-btn" @click="$emit('move')">Переместить</button>
            </div>
        </template>
        <template v-else>
            <input type="text" v-model="task.title" placeholder="Заголовок задачи" />
            <textarea v-model="task.description" placeholder="Описание задачи"></textarea>
            <input type="date" v-model="task.deadline" placeholder="Дэдлайн" />
            <div class="actions">
                <button class="save-btn" @click="saveTask">Сохранить</button>
                <button class="cancel-btn" @click="cancelEdit">Отмена</button>
            </div>
        </template>
    </div>`,
    methods: {
        startEdit() {
            console.log('Режим редактирования активирован');
            this.$emit('edit', { ...this.task, isEditing: true }); // Передаём задачу с флагом isEditing
        },
        saveTask() {
            const updatedTask = { ...this.task, isEditing: false, lastEditedAt: new Date().toLocaleString() };
            this.$emit('edit', updatedTask); // Передаём обновлённую задачу
        },
        cancelEdit() {
            this.$emit('edit', { ...this.task, isEditing: false }); // Отмена редактирования
        }
    }
});

new Vue({
    el: '#app',
    data: {
        plannedTasks: [],
        inProgressTasks: [],
    },
    methods: {
        addTask(task) {
            this.plannedTasks.push(task);
        },
        deleteTask(column, index) {
            if (column === 'Запланированные задачи') {
                this.plannedTasks.splice(index, 1);
            } else if (column === 'Задачи в работе') {
                this.inProgressTasks.splice(index, 1);
            }
        },
        editTask(column, updatedTask, index) {
            let tasksArray = column === 'Запланированные задачи' ? this.plannedTasks : this.inProgressTasks;
            this.$set(tasksArray, index, updatedTask);
        },
        moveTask(fromColumn, toColumn, index) {
            let movedTask;

            if (fromColumn === 'Запланированные задачи') {
                movedTask = this.plannedTasks.splice(index, 1)[0];
                if (toColumn === 'Задачи в работе') {
                    this.inProgressTasks.push(movedTask);
                    console.log('Перемещено в "Задачи в работе":', movedTask);
                }
            } else if (fromColumn === 'Задачи в работе') {
                movedTask = this.inProgressTasks.splice(index, 1)[0];
                if (toColumn === 'Тестирование') {
                    console.log('Перемещено в "Тестирование":', movedTask);
                }
            }
        }
    }
});