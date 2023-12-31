package dev.jtong.training.demo.smart.domain.persistent.model.user.mybatis;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

public class NoAnnotationUser {

    private String id;

    private String name;

    private int age;

    private String password; // 新增

    // 在构造函数和 getter/setter 中添加对应的处理
    public User(String id, String name, Integer age, String password) {
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


    public String getName() {
        return name;
    }

    public Integer getAge() {
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

    public void setAge(Integer age) {
        this.age = age;
    }
}
