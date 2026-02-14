import Task from "../model/task.js";

export const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo } = req.body;

    const task = await Task.create({
      title,
      description,
      assignedTo,
      createdBy: req.user._id,
    });

    // 🔥 Emit real-time event
    const io = req.app.get("io");
    io.emit("taskCreated", task);

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const status = req.query.status;
    const sortOrder = req.query.sort === "asc" ? 1 : -1;
    const search = req.query.search;

    const query = {
      isDeleted: false,
    };

    // ✅ Status filter
    if (status) {
      query.status = status;
    }

    // ✅ Search filter (IMPORTANT FIX)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const tasks = await Task.find(query)
      .sort({ createdAt: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Task.countDocuments(query);

    res.json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      tasks,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task || task.isDeleted) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (req.user.role === "user") {
      // User can only change status
      task.status = req.body.status || task.status;
    } else {
      // Admin/Manager full update
      Object.assign(task, req.body);
    }

    const updatedTask = await task.save(); // ✅ SAVE FIRST

    const io = req.app.get("io");
    io.emit("taskUpdated", updatedTask); // ✅ EMIT AFTER SAVE

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.isDeleted = true;
    await task.save();

    const io = req.app.get("io");
    io.emit("taskDeleted", task._id);

    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
