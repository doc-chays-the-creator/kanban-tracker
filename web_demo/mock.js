if (!localStorage.getItem('kanban-board-v5')) {
  localStorage.setItem('kanban-board', JSON.stringify({
    cards: [
      {id:'1', title:'Schedule spring break trip', description:'Research flights, check hotel availability, and plan daily activities for the family.', columnId:'todo', order:0, priority:'high', category:'personal', createdAt:new Date().toISOString(), updatedAt:new Date().toISOString()},
      {id:'2', title:'Take kids to the amusement park', description:'Buy tickets online, pack snacks, check weather forecast.', columnId:'todo', order:1, priority:'medium', category:'personal', createdAt:new Date().toISOString(), updatedAt:new Date().toISOString()},
      {id:'3', title:'Review quarterly budget', description:'Analyze Q1 spending, project Q2 expenses, prepare slides.', columnId:'in-progress', order:0, priority:'high', category:'professional', createdAt:new Date().toISOString(), updatedAt:new Date().toISOString()},
      {id:'4', title:'Buy groceries for the week', description:'Milk, eggs, bread, vegetables, and snacks.', columnId:'in-progress', order:1, priority:'low', category:'personal', createdAt:new Date().toISOString(), updatedAt:new Date().toISOString()},
      {id:'5', title:'Book dentist appointment', description:'Call Dr. Smith office for a checkup.', columnId:'done', order:0, priority:'medium', category:'personal', createdAt:new Date().toISOString(), updatedAt:new Date().toISOString(), completedAt:new Date().toISOString()},
      {id:'6', title:'Review lease agreement for Downtown property', description:'Ensure all tenant clauses are standard.', columnId:'done', order:1, priority:'high', category:'professional', createdAt:new Date().toISOString(), updatedAt:new Date().toISOString(), completedAt:new Date().toISOString()},
      {id:'7', title:'Finalize Q3 marketing strategy', description:'Align with the new branding guidelines.', columnId:'done', order:2, priority:'medium', category:'professional', createdAt:new Date().toISOString(), updatedAt:new Date().toISOString(), completedAt:new Date().toISOString()}
    ],
    logEntries: []
  }));
  localStorage.setItem('kanban-board-v5', 'true');
}

window.kanban = {
  loadBoard: async () => JSON.parse(localStorage.getItem("kanban-board")) || { cards: [], logEntries: [] },
  saveBoard: async (data) => localStorage.setItem("kanban-board", JSON.stringify(data)),
  loadConfig: async () => JSON.parse(localStorage.getItem("kanban-config")) || {},
  saveConfig: async (data) => localStorage.setItem("kanban-config", JSON.stringify(data)),
  syncLog: async () => ({ success: true }),
  fetchLog: async () => ({ success: true, content: "" })
};
