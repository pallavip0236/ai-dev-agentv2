export const stats = {
  totalProjects: 12,
  openTickets: 54,
  closedTickets: 120,
};

export const projects = [
  { name: "Payment API", key: "PAY", lead: "DevOps", status: "Active" },
  { name: "Order Service", key: "ORD", lead: "Backend", status: "Active" },
  { name: "Authentication", key: "AUTH", lead: "Security", status: "Active" },
  { name: "User Management", key: "USR", lead: "Frontend", status: "Active" },
  { name: "Notification Service", key: "NOTIFY", lead: "Support", status: "Active" },
];

export const tickets = [
  { id: "PAY-102", title: "Payment Failure", priority: "High", status: "Open" },
  { id: "ORD-130", title: "Order Processing", priority: "Medium", status: "Closed" },
  { id: "AUTH-110", title: "Login Timeout Issue", priority: "High", status: "Open" },
  { id: "PAY-101", title: "Payment Endpoint Bug", priority: "Low", status: "In Progress" },
];

export const activities = [
  { date: "May 22", event: "Ticket PAY-102 assigned to John D.", project: "Payment API", status: "Open" },
  { date: "May 21", event: "Ticket AUTH-210 created", project: "Authentication", status: "Open" },
  { date: "May 20", event: "New project Notification Service created", project: "Notification", status: "Active" },
];

export const activeProjects = [
  { name: "Payment API", progress: 80 },
  { name: "Order Service", progress: 60 },
  { name: "Authentication", progress: 45 },
  { name: "User Management", progress: 75 },
];

export const ticketOverview = [
  { name: "Open", value: 24 },
  { name: "In Progress", value: 12 },
  { name: "Closed", value: 48 },
];