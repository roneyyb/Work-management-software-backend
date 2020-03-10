const express = require('express');
const Task = require('../database/taskmodel');
const checkworkid = require('../middleware/checkworkid');
const workcheck = require('../middleware/workcheck');
const router = new express.Router();
const accountcheck = require('../middleware/accountcheck');
const checkid = require('../middleware/checkid');

router.delete('/multitaskdelete',accountcheck, async (req, res) => {
  try{
    console.log('task to delete in database',req.body.deletetasklist);
    await req.body.deletetasklist.every(async tasks => {
      const task = await Task.findOne({
        _id: tasks.taskid,
        workid_backend: tasks.workid
      });
      if(task) {
      await task.remove();
      }
      return true;
    });
    res.send({ message: 'task successfully deleted',error:'' });
  } catch(error) {
    res.status(404).send({error:error});
  }
});

router.post('/multitaskcreate/:id',checkid,async (req, res) => {
  try
  {
    var array = [];
    console.log(req.body.tasklist);
  await req.body.tasklist.every((tasks) => {
    const task = new Task({...tasks});
    console.log(task);
      task.save();
      array.push({taskid: task.taskid, taskid_backend: task._id});
    return true;
  });
  
  console.log('array send to frontend =>',array);
  res.status(201).send({taskidbackend:array,error:''});
  }
  catch(error) {
    res.status(200).send({error:error});
    console.log(error);
  }
});
router.patch('/multitaskupdate', accountcheck, async (req,res) => {
  try {
    //console.log(req);
    await req.body.tasklist.every( async(tasks) => {
      const { update_type,task_pehchan,...rest } = tasks;
      const task = { ...rest };
      console.log(task);
      await Task.updateOne({ workid_backend: task.workid_backend, _id: tasks.taskid_backend},{
        ...task
      },(error, response) => {
        if (response) {
          console.log('response =>', response);
        }
        if (error) {
          console.log('error =>', error);
        }
      });
      return true;
    });
    res.status(201).send({'message':'work updated',error:''});
  }catch(error) {
    res.status(400).send({error:error});
    console.log(error);
  }
});

router.get('/alltaskget',accountcheck, async (req,res) => {
  try {
      await req.user
        .populate({
          path: 'mywork'
        })
      .execPopulate();
      console.log('work returned =>', req.user.mywork);
      var tasklist = [];
      var len = req.user.mywork.length;
      var count = 0;
      await req.user.mywork.forEach(async work => {
          try {await work
        .populate({
          path: 'mytask'
          })
        .execPopulate();
        console.log(work.mytask);
         tasklist.push(...work.mytask);
          } catch(error) {
            console.log(error);
          }
          if(++count === len)
          {
            console.log(tasklist);
            res.status(200).send({tasklist:tasklist});
          }
      });
      console.log('pehle chal gaya');
      
  } catch(error) {
    res.status(400).send({error});
  }
});
router.post('/taskcreate/:id', checkworkid, async (req, res) => {
  const task = new Task({ ...req.body, workid: req.params.id });
  console.log('task', req.body);
  try {
    await task.save();
    res.status(200).send({ message: 'Task created successfully' });
  } catch (e) {
    res.status(400).send({ error: e });
  }
});

router.get('/taskget', workcheck, async (req, res) => {
  const match = {};
  const sort = {};
  const update = {};
  console.log(req.query.completed);
  if (req.query.completed) {
    match.completed = req.query.completed === 'true';
  }
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':');
    console.log('parts =>', parts);
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    console.log(sort);
  }
  if (req.query.updatedBy) {
    const parts = req.query.updatedBy.split(':');
    updated[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  }
  console.log(req.work, match, req.query);
  try {
    await req.work
      .populate({
        path: 'mytask',
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
          update
        }
      })
      .execPopulate();
    //console.log('mytask', req.work.mytask);
    // const datas = await Task.find({
    //   workid: req.work._id,
    //   completed: req.query.completed
    // });
    // console.log('datas =>', datas);
    // //const data = await Task.returndata(req.work._id, req.query.completed);
    //console.log(data);
    //console.log(req.work.mytask);
    res.status(200).send({ message: req.work.mytask });
  } catch (e) {
    res.status(404).send({ error: e });
  }
});


router.patch('/taskupdate/:id', workcheck, async (req, res) => {
  const allowedUpdate = ['title', 'description', 'completed'];
  console.log(req.body);
  const updates = Object.keys(req.body);
  const isValidUpdate = updates.every(u => allowedUpdate.includes(u));
  if (!isValidUpdate) return res.status(400).send({ error: 'invalid update' });
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      workid: req.work._id
    });
    if (!task) {
      return res.status(404).send({ error: 'Task Not found' });
    }
    console.log(req.body);
    //Dont use every here dint know what is the problem but dont use it here
    await updates.forEach(u => {
      console.log(u);
      console.log(task[u], '==', req.body[u]);
      task[u] = req.body[u];
    });
    await task.save();
    res.send({ message: task });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete('/taskdelete/:id', workcheck, async (req, res) => {
  try {
    console.log('id', req.params.id);
    const task = await Task.findOne({
      _id: req.params.id,
      workid: req.work._id
    });
    if (!task) {
      return res.status(404).send({ error: 'task not found' });
    }
    await task.remove();
    res.send({ message: 'task successfully deleted' });
  } catch (e) {
    res.status(500).send(e);
  }
});

router.patch('/multitaskupdate', workcheck, async (req, res) => {
  try {
    const updatedid = req.header('updateids').split(',');
    Task.updateMany({ workid: req.work._id, _id: { $in: updatedid } }, { completed: true }, (error, response) => {
      if (response) {
      console.log('response =>', response);
      }
      
      if (error) 
      {
        console.log('error =>', error);
      }
    });
      res.status(200).send({ message: 'All the task deleted!' });
  } catch (e) {
    console.log(e);
    res.status(500).send({error: 'server problem'});
  }
});

router.delete('/multitaskdelete', workcheck, async (req, res) => {
  try {
    
  console.log('multideleteid', req.header('Authorization'), req.header('deletedids'));
  const deletedid = req.header('deletedids').split(',');
  console.log(req.work._id,deletedid);
  //without the fucntion in multidelete it wont work properly
  Task.deleteMany({workid: req.work._id, _id: { $in: deletedid }}, (error,response) => {
    console.log('response =>',response);
   });
    res.status(200).send({ message: 'tasks deleted!' });
  } catch (e) {
    console.log(e);
    res.status(500).send({error: 'server problem' });
  }
});

module.exports = router;
