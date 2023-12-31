const {expect} = require('chai');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const read_model = require('../index');
const {parse} = require('java-parser');
const javaParser = require("java-parser");


describe('build imports', function () {

    it("should handle *", function () {
        // 读取Java文件
        const javaContent = fs.readFileSync(path.join(__dirname, 'cases', 'code', "NoAnnotationUser.java"), 'utf8');

        // 解析Java文件
        const javaAST = javaParser.parse(javaContent);
        let result = read_model(__dirname, {
            path: "cases/code/NoAnnotationUser.java"
        });
        console.log(result);
        expect(result).to.deep.equal(`package dev.jtong.training.demo.smart.domain.persistent.model.user.mybatis;

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
    private String password;
}`);
    });
})
;