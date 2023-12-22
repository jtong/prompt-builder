分析下面changePassword函数依赖了哪些类和类里的哪些方法
```java
package dev.jtong.training.demo.smart.domain.controllers;

import dev.jtong.training.demo.smart.domain.persistent.model.user.mybatis.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/users")
public class UsersController {
    @Autowired
    private UserModelMapper userModelMapper;
    @Autowired
    private RoleMapper roleMapper;
    @PatchMapping("/{userId}/password")
    public ResponseEntity changePassword(@PathVariable Long userId, @RequestParam String oldPassword, @RequestParam String newPassword) {
        // 首先检查用户是否存在
        User user = userModelMapper.findUserById(userId.toString());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); // 用户不存在
        }
        PasswordChangeRequest request = new PasswordChangeRequest(userId, oldPassword, newPassword);
        userModelMapper.updatePassword(request);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build(); // 密码成功更新
    }
}
```
按照下面的格式输出
```yaml
classes:
  - name: <class name>
    methods:
      - <method name>
```