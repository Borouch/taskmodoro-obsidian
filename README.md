# taskmodoro

taskmodoro is a fork of [tgrosinger/tq-obsidian)](https://github.com/tgrosinger/tq-obsidian). It’s an [Obsidian](https://obsidian.md) file-based task manager with integrated pomodoro timer. Each task is represented as a Markdown note with a single task line and some metadata in the frontmatter. Tasks are viewed by embedding queries in other notes, such as your Daily Note.
  
![task details](https://raw.githubusercontent.com/Borouch/taskmodoro-obsidian/main/resources/screenshots/query_tasks_list_with_timer.png)

![create-task](https://raw.githubusercontent.com/Borouch/taskmodoro-obsidian/main/resources/screenshots/task-details.png)

  

![edit task repeat](https://raw.githubusercontent.com/Borouch/taskmodoro-obsidian/main/resources/screenshots/task-details-subtask.png)


An example task note:

```
---
created_at: 2022-08-01T21:44:27.366Z
pomodoro_length:
  minutes: 30
repeat: every day
tags:
  - '#inbox'

completed:
  - '2022-08-02'
due: 2022-08-02T21:00:00.000Z
scheduled: '2022-08-02'
estimated_worktime:
  minutes: 540
daily_scheduled_worktime:
  '2022-08-02':
    minutes: 60
---

## Task
- [ ] Demo task

<!---DESC_START--->
demo description
<!---DESC_END--->
```

**More functionality will be added to this plugin when needed by my tasks workflow**.

Contributions are very welcome.

## Query blocks

Tasks query synax with few differences is very similar to [obsidian-tasks](https://github.com/obsidian-tasks-group/obsidian-tasks) plugin although supported feature set is more limited.

Tasks can be queried by using custom code blocks in notes. Here's an example:

Include all tasks with `#inbox` tag grouped by completion status.

  

	```tq
	tags include #inbox
	group by completed
	```


  

Or for a more complicated example:

  

	```taskmodoro
	scheduled after 2022-07-28
	due before 2022-08-05
	not completed
	group by tags
	exclude subtasks
	```

  

### Query syntax



|  Filter                                                                                    |  Sort                                         | Group                 |
|:-------------------------------------------------------------------------------------------|:----------------------------------------------|:----------------------|
|  completed, not completed. done, not done, failed, not failed                              |  sort by status                               |  group by status      |
|  scheduled (before, after, on) &lt;date&gt;has scheduled date, no scheduled date           |  sort by scheduled                            |  group by scheduled   |
|  due (before, after, on) &lt;date&gt;has due date, no due date                             |  sort by due                                  |  group by due         |
|  is recurring, is not recurring                                                            |  &nbsp;                                       |  group by recurring   |
|  &nbsp;                                                                                    |  &nbsp;                                       |  group by recurrence  |
|  description (includes, does not include) &lt;string&gt;                                   |  sort by description                          |  &nbsp;               |
|  tag (includes, does not include) &lt;tag&gt;tags (include, do not include) &lt;tag&gt;    |  sort by tag, sort by tag &lt;tag_number&gt;  |  group by tags        |
|  (filter 1) AND (filter 2)                                                                 |  &nbsp;                                       |  &nbsp;               |
|  (filter 1) OR (filter 2)                                                                  |  &nbsp;                                       |  &nbsp;               |
|  NOT (filter 1)                                                                            |  &nbsp;                                       |  &nbsp;               |
|  (filter 1) XOR (filter 2)                                                                 |  &nbsp;                                       |  &nbsp;               |
|  (filter 1) AND NOT (filter 2)                                                             |  &nbsp;                                       |  &nbsp;               |
|  (filter 1) OR NOT (filter 2)                                                              |  &nbsp;                                       |  &nbsp;               |
|  (filter 1) AND ((filter 2) OR (filter 3))                                                 |  &nbsp;                                       |  &nbsp;               |
|  exclude subtasks                                                                          |  &nbsp;                                       |  &nbsp;               |  

### Limitations
Task creation and details modal view is not yet supported on mobile.

### Acknowledgments
Current feature set wouldn’t be possible without the initial functionality provided by the creator of [tgrosinger/tq-obsidian](https://github.com/tgrosinger/tq-obsidian) . 

And some features reproduced from  [obsidian-tasks-group/obsidian-tasks](https://github.com/obsidian-tasks-group/obsidian-tasks) , [mgmeyers/obsidian-kanban](https://github.com/mgmeyers/obsidian-kanban) plugins. 

Big thanks to creators and contributors for their efforts!

### Support
If you find this plugin useful consider supporting me in the following way:

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/Borouch)