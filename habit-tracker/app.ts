interface Task {
  id: number;
  title: string;
  minutes: number;
  priority: 'high' | 'medium' | 'low';
  done: boolean;
}

class FocusApp {
  private tasks: Task[] = [];

  private form: HTMLFormElement;
  private titleInput: HTMLInputElement;
  private timeInput: HTMLInputElement;
  private prioritySelect: HTMLSelectElement;
  private listElement: HTMLUListElement;
  private completedStat: HTMLElement;
  private timeStat: HTMLElement;

  constructor() {
    this.form = document.getElementById('taskForm') as HTMLFormElement;
    this.titleInput = document.getElementById('taskInput') as HTMLInputElement;
    this.timeInput = document.getElementById('timeInput') as HTMLInputElement;
    this.prioritySelect = document.getElementById('prioritySelect') as HTMLSelectElement;
    this.listElement = document.getElementById('taskList') as HTMLUListElement;
    this.completedStat = document.getElementById('completedStat') as HTMLElement;
    this.timeStat = document.getElementById('timeStat') as HTMLElement;

    this.init();
  }

  private init(): void {
    this.loadTasks();

    this.form.addEventListener('submit', (e: Event) => {
      e.preventDefault();
      this.addTask();
    });

    this.render();
  }

  private loadTasks(): void {
    const saved = localStorage.getItem('focus_tasks');
    if (saved) {
      try {
        this.tasks = JSON.parse(saved);
      } catch (e) {
        this.tasks = [];
      }
    } else {
      // Default starter tasks
      this.tasks = [
        { id: 1, title: 'Review pull request', minutes: 20, priority: 'high', done: false },
        { id: 2, title: 'Update documentation', minutes: 15, priority: 'medium', done: true }
      ];
    }
  }

  private saveTasks(): void {
    localStorage.setItem('focus_tasks', JSON.stringify(this.tasks));
  }

  private addTask(): void {
    const title = this.titleInput.value.trim();
    const minutes = parseInt(this.timeInput.value, 10);
    if (!title || isNaN(minutes)) return;

    const newTask: Task = {
      id: Date.now(),
      title,
      minutes,
      priority: this.prioritySelect.value as Task['priority'],
      done: false
    };

    this.tasks.unshift(newTask);
    this.saveTasks();
    this.titleInput.value = '';
    this.timeInput.value = '';
    this.render();
  }

  public toggleTask(id: number): void {
    this.tasks = this.tasks.map((t: Task) => {
      if (t.id === id) {
        return { ...t, done: !t.done };
      }
      return t;
    });
    this.saveTasks();
    this.render();
  }

  public deleteTask(id: number): void {
    this.tasks = this.tasks.filter((t: Task) => t.id !== id);
    this.saveTasks();
    this.render();
  }

  public clearCompleted(): void {
    this.tasks = this.tasks.filter((t: Task) => !t.done);
    this.saveTasks();
    this.render();
  }

  private getPriorityColor(priority: Task['priority']): string {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
    }
  }

  private render(): void {
    this.listElement.innerHTML = '';

    const doneCount = this.tasks.filter((t) => t.done).length;
    const totalMinutes = this.tasks
      .filter((t) => t.done)
      .reduce((acc, t) => acc + t.minutes, 0);

    this.completedStat.textContent = `${doneCount}/${this.tasks.length}`;
    this.timeStat.textContent = `${totalMinutes} mins`;

    if (this.tasks.length === 0) {
      this.listElement.innerHTML = `
        <li style="text-align: center; color: #94a3b8; padding: 24px; font-size: 14px;">
          No tasks added yet. Start by setting a goal above!
        </li>
      `;
      return;
    }

    this.tasks.forEach((task: Task) => {
      const li = document.createElement('li');
      li.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: ${task.done ? '#f8fafc' : '#ffffff'};
        border: 1px solid ${task.done ? '#e2e8f0' : '#cbd5e1'};
        border-radius: 10px;
        margin-bottom: 8px;
        opacity: ${task.done ? '0.6' : '1'};
        transition: all 0.2s ease;
      `;

      li.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <input 
            type="checkbox" 
            ${task.done ? 'checked' : ''} 
            style="width: 18px; height: 18px; cursor: pointer;"
            onchange="window.focusApp.toggleTask(${task.id})"
          />
          <div>
            <span style="font-weight: 600; color: #0f172a; text-decoration: ${task.done ? 'line-through' : 'none'};">
              ${task.title}
            </span>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
              ⏱️ ${task.minutes} mins
            </div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: ${this.getPriorityColor(task.priority)}; color: white; font-weight: 700; text-transform: uppercase;">
            ${task.priority}
          </span>
          <button 
            onclick="window.focusApp.deleteTask(${task.id})"
            style="background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 14px;"
            onmouseover="this.style.color='#ef4444'"
            onmouseout="this.style.color='#94a3b8'"
          >✕</button>
        </div>
      `;

      this.listElement.appendChild(li);
    });
  }
}

declare global {
  interface Window {
    focusApp: FocusApp;
  }
}

window.focusApp = new FocusApp();