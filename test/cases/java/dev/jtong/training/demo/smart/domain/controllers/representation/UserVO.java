package dev.jtong.training.demo.smart.domain.controllers.representation;

import dev.jtong.training.demo.smart.domain.persistent.model.user.mybatis.User;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class UserVO {
    private String id;

    private String name;
    private int age;

    private String password; // 新增


    public UserVO(String id, String name, int age) {
        this.id = id;
        this.name = name;
        this.age = age;
    }

    public UserVO(String id, String name, Integer age, String password) {
        this.id = id;
        this.name = name;
        this.age = age;
        this.password = password; // 新增
    }

    public String getPassword() {
        return password; // 新增
    }

    public void setPassword(String password) {
        this.password = password; // 新增
    }

    public User toDomain(){
        return new User(this.id, this.name, this.age, this.password);
    }

    public static UserVO fromDomain(User user){
        UserVO userVO = new UserVO(user.getId(), user.getName(), user.getAge());
        return userVO;
    }

    public String getName() {
        return name;
    }

    public int getAge() {
        return age;
    }

    public String getId() {
        return this.id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setAge(int age) {
        this.age = age;
    }

}
