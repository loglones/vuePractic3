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
                    :title="title"
                    @delete="$emit('delete-task', title, index)" 
                    @edit="$emit('edit-task', title, $event, index)" 
                    @move="$emit('move-task', title, index)"
                    @return="$emit('return-task', title, index, $event)">
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
    props: ['task', 'title'],
    template: `
    <div class="task-card" :class="{ 'overdue': isOverdue && title === 'Выполненные задачи' }">
        <template v-if="!task.isEditing">
            <h3>{{ task.title }}</h3>
            <p><strong>Описание:</strong> {{ task.description }}</p>
            <p><strong>Дэдлайн:</strong> {{ task.deadline }}</p>
            <p><strong>Создана:</strong> {{ task.createdAt }}</p>
            <p><strong>Последнее изменение:</strong> {{ task.lastEditedAt }}</p>
            <p v-if="task.returnReason"><strong>Причина возврата:</strong> {{ task.returnReason }}</p>
            <p v-if="isOverdue && title === 'Выполненные задачи'" class="overdue-text">Задача выполнена не в срок</p>
            <div class="actions">
                <button class="edit-btn" @click="startEdit">Редактировать</button>
                <button class="delete-btn" @click="$emit('delete')">Удалить</button>
                <button class="move-btn" @click="moveTask">Переместить</button>
                <button class="return-btn" v-if="title === 'Тестирование'" @click="showReturnReasonPrompt">Вернуть</button>
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
    computed: {
        isOverdue() {
            if (!this.task.deadline) return false;
            const deadline = new Date(this.task.deadline);
            const now = new Date();
            return now > deadline;
        }
    },
    methods: {
        startEdit() {
            console.log('Режим редактирования активирован');
            this.$emit('edit', { ...this.task, isEditing: true });
        },
        saveTask() {
            const updatedTask = { ...this.task, isEditing: false, lastEditedAt: new Date().toLocaleString() };
            this.$emit('edit', updatedTask);
        },
        cancelEdit() {
            this.$emit('edit', { ...this.task, isEditing: false });
        },
        showReturnReasonPrompt() {
            const reason = prompt('Введите причину возврата:');
            if (reason !== null) {
                this.$emit('return', reason);
            }
        },
        moveTask() {
            this.$emit('move');
        }
    }
});

new Vue({
    el: '#app',
    data: {
        plannedTasks: [],
        inProgressTasks: [],
        testingTasks: [],
        completedTasks: []
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
            } else if (column === 'Тестирование') {
                this.testingTasks.splice(index, 1);
            } else if (column === 'Выполненные задачи') {
                this.completedTasks.splice(index, 1);
            }
        },
        editTask(column, updatedTask, index) {
            let tasksArray;
            if (column === 'Запланированные задачи') {
                tasksArray = this.plannedTasks;
            } else if (column === 'Задачи в работе') {
                tasksArray = this.inProgressTasks;
            } else if (column === 'Тестирование') {
                tasksArray = this.testingTasks;
            } else if (column === 'Выполненные задачи') {
                tasksArray = this.completedTasks;
            }
            if (tasksArray) {
                this.$set(tasksArray, index, updatedTask);
            }
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
                    this.testingTasks.push(movedTask);
                    console.log('Перемещено в "Тестирование":', movedTask);
                }
            } else if (fromColumn === 'Тестирование') {
                movedTask = this.testingTasks.splice(index, 1)[0];
                if (toColumn === 'Выполненные задачи') {
                    this.completedTasks.push(movedTask);
                    console.log('Перемещено в "Выполненные задачи":', movedTask);
                }
            }
        },
        returnTask(fromColumn, index, reason) {
            if (fromColumn === 'Тестирование') {
                const movedTask = this.testingTasks.splice(index, 1)[0];
                movedTask.returnReason = reason || 'Не указано';
                this.inProgressTasks.push(movedTask);
                console.log('Возвращено в "Задачи в работе" с причиной:', movedTask.returnReason);
            }
        }
    }
});