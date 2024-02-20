package dev.jtong.training.demo.smart.domain.controllers;

import dev.jtong.training.demo.smart.domain.controllers.representation.UserRole;
import dev.jtong.training.demo.smart.domain.controllers.representation.UserVO;
import dev.jtong.training.demo.smart.domain.persistent.model.user.mybatis.*;
import dev.jtong.training.demo.smart.domain.persistent.support.mybatis.IdHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
public class UsersController {

    @Autowired
    private UserModelMapper userModelMapper;
    @Autowired
    private RoleMapper roleMapper;

    @GetMapping("/{userId}")
    public ResponseEntity<UserVO> getUser(@PathVariable Long userId) {

        User user = userModelMapper.findUserById(userId.toString());
        return ResponseEntity.status(HttpStatus.OK).body(UserVO.fromDomain(user));
    }

    @GetMapping("")
    public ResponseEntity<List<UserVO>> getUsers(@RequestParam(value = "ageBiggerThan", defaultValue = "16") int ageBar) {
        List<User> users = userModelMapper.findUsersAgeBiggerThan(0, 255, ageBar);
        List<UserVO> userVOs = users.stream().map(UserVO::fromDomain).collect(Collectors.toList());
        return ResponseEntity.status(HttpStatus.OK).body(userVOs);
    }

    //@PostMapping("") //原始的映射
    @PostMapping(value = "", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<UserVO> postUser(@RequestBody UserVO userVO) {
        User user = userVO.toDomain();
        IdHolder idHolder = new IdHolder();
        userModelMapper.insertUser(idHolder, user);
        user.setId(idHolder.id());
        return ResponseEntity.status(HttpStatus.CREATED).body(UserVO.fromDomain(user));
    }

    @PutMapping("/{userId}")
    public ResponseEntity putUser(@PathVariable Long userId, @RequestBody UserVO userVORequest) {
        User user = userModelMapper.findUserById(userId.toString());
        if (user != null) {
            user.setName(userVORequest.getName());
            user.setAge(userVORequest.getAge());
            userModelMapper.updateUser(user);
        }
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<UserVO> deleteUser(@PathVariable Long userId) {
        User user = userModelMapper.findUserById(userId.toString());
        if (user != null) {
            userModelMapper.deleteUserById(user.getId());
            return ResponseEntity.status(HttpStatus.OK).build();
        };
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

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


    @PostMapping("/{userId}/roles")
    public ResponseEntity<?> assignRoleToUser(@PathVariable String userId, @RequestBody UserRole role) {
        try {
            // 检查用户是否存在
            User user = userModelMapper.findUserById(userId);
            if (user == null) {
                return ResponseEntity.badRequest().body("User not found.");
            }

            // 检查角色是否存在
            Role existingRole = roleMapper.getRoleById(role.getId());
            if (existingRole == null) {
                return ResponseEntity.badRequest().body("Role not found.");
            }

            // 为用户分配角色
            roleMapper.assignRoleToUser(userId, role.getId());
            return ResponseEntity.ok("Role assigned successfully to user.");
        } catch (Exception e) {
            // 处理任何异常情况
            return ResponseEntity.badRequest().body("Error while assigning role: " + e.getMessage());
        }
    }
}
