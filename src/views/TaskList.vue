<template>
    <div class="task-list-container">
        <div class="header">
            <h1>My Tasks</h1>
            <div class="actions">
                <button class="new-task-btn" @click="openTaskModal()">+ New Task</button>
                <button class="logout-btn" @click="logout">Logout</button>
            </div>
        </div>

        <div v-if="loading" class="loading">Loading tasks...</div>
        <div v-else-if="error" class="error-message">{{ error }}</div>
        <div v-else-if="tasks.length === 0" class="no-tasks">
            No tasks found. Create your first task!
        </div>

        <div v-else class="tasks">
            <div v-for="task in tasks" :key="task.id" class="task-card">
                <div class="task-header">
                    <h2 :class="{ 'completed': task.status }">{{ task.title }}</h2>
                    <div class="task-actions">
                        <button class="edit-btn" @click="openTaskModal(task)">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="delete-btn" @click="confirmDelete(task.id)">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
                <p class="description">{{ task.description }}</p>
                <div class="task-details">
                    <div class="due-date" :class="{ 'overdue': isOverdue(task.due_date) }">
                        <i class="fas fa-calendar-alt"></i> Due: {{ formatDate(task.due_date) }}
                    </div>
                    <div class="status">
                        <label class="status-toggle">
                            <input type="checkbox" :checked="task.status" @change="toggleStatus(task)">
                            <span class="status-label">{{ task.status ? 'Completed' : 'Pending' }}</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="showDeleteModal" class="modal-overlay">
            <div class="modal">
                <div class="modal-content delete-modal">
                    <h3>Confirm Delete</h3>
                    <p>Are you sure you want to delete this task?</p>
                    <div class="modal-actions">
                        <button class="cancel-btn" @click="showDeleteModal = false">Cancel</button>
                        <button class="delete-btn" @click="deleteTask">Delete</button>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="showTaskModal" class="modal-overlay" @click.self="closeTaskModal">
            <div class="modal">
                <div class="modal-content task-modal">
                    <div class="modal-header">
                        <h3>{{ editingTask ? 'Edit Task' : 'New Task' }}</h3>
                        <button class="close-btn" @click="closeTaskModal">&times;</button>
                    </div>
                    <form @submit.prevent="saveTask">
                        <div class="form-group">
                            <label for="title">Title</label>
                            <input id="title" v-model="form.title" type="text" required
                                placeholder="Enter task title" />
                        </div>
                        <div class="form-group">
                            <label for="description">Description</label>
                            <textarea id="description" v-model="form.description"
                                placeholder="Enter task description"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="due_date">Due Date</label>
                            <input id="due_date" v-model="form.due_date" type="date" />
                        </div>
                        <div class="form-group">
                            <label for="status">Status</label>
                            <select id="status" v-model="form.status">
                                <option :value="false">Pending</option>
                                <option :value="true">Completed</option>
                            </select>
                        </div>
                        <div class="modal-actions">
                            <button type="button" class="cancel-btn" @click="closeTaskModal">Cancel</button>
                            <button type="submit" class="save-btn">{{ editingTask ? 'Update Task' : 'Create Task'
                                }}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import api from '../services/TaskService'

export default {
    name: 'TaskList',
    data() {
        return {
            tasks: [],
            loading: true,
            error: null,
            showDeleteModal: false,
            taskToDelete: null,
            showTaskModal: false,
            editingTask: null,
            form: {
                title: '',
                description: '',
                due_date: '',
                status: false,
            },
        }
    },
    created() {
        this.fetchTasks()
    },
    methods: {
        async fetchTasks() {
            this.loading = true
            this.error = null
            try {
                const response = await api.getTasks()
                this.tasks = response
            } catch (err) {
                this.error = 'Failed to load tasks. Please try again.'
            } finally {
                this.loading = false
            }
        },
        formatDate(dateString) {
            if (!dateString) return 'No due date'
            return new Date(dateString).toLocaleDateString()
        },
        isOverdue(dateString) {
            if (!dateString) return false
            const dueDate = new Date(dateString)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            return dueDate < today && !this.status
        },
        openTaskModal(task = null) {
            if (task) {
                this.editingTask = task
                this.form = { ...task }
            } else {
                this.editingTask = null
                this.form = { title: '', description: '', due_date: '', status: false }
            }
            this.showTaskModal = true
            document.body.style.overflow = 'hidden' 
        },
        closeTaskModal() {
            this.showTaskModal = false
            this.editingTask = null
            document.body.style.overflow = '' 
        },
        async saveTask() {
            try {
                if (this.editingTask) {
                    const response = await api.updateTask(this.editingTask.id, this.form)
                    const index = this.tasks.findIndex(t => t.id === this.editingTask.id)
                    this.tasks[index] = response
                } else {
                    const response = await api.createTask(this.form)
                    this.tasks.push(response)
                }
                this.closeTaskModal()
            } catch (error) {
                this.error = 'Failed to save task. Please try again.'
                console.error(error)
            }
        },
        confirmDelete(id) {
            this.taskToDelete = id
            this.showDeleteModal = true
            document.body.style.overflow = 'hidden' 
        },
        async deleteTask() {
            if (!this.taskToDelete) return
            try {
                await api.deleteTask(this.taskToDelete)
                this.tasks = this.tasks.filter(task => task.id !== this.taskToDelete)
                this.showDeleteModal = false
                this.taskToDelete = null
                document.body.style.overflow = '' 
            } catch (error) {
                this.error = 'Failed to delete task. Please try again.'
            }
        },
        async toggleStatus(task) {
            try {
                const updatedTask = { ...task, status: !task.status }
                const response = await api.updateTask(task.id, updatedTask)
                const index = this.tasks.findIndex(t => t.id === task.id)
                if (index !== -1) {
                    this.tasks[index].status = response.status
                }
            } catch (error) {
                this.error = 'Failed to update task status. Please try again.'
            }
        },
        logout() {
            localStorage.removeItem('token')
            this.$router.push({ name: 'Login' })
        },
    },
}
</script>

<style src="@/assets/styles/style.css" scoped></style>
