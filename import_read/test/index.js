const {expect} = require('chai');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const read_import = require('../index');
const {parse} = require('java-parser');
const javaParser = require("java-parser");


describe('build imports', function () {

    it("should handle *", function () {
        // 读取Java文件
        const javaContent = fs.readFileSync(path.join(__dirname, 'cases', 'code', "UserController.java"), 'utf8');

        // 解析Java文件
        const javaAST = javaParser.parse(javaContent);
        let result = read_import(javaAST);
        console.log(result);
        expect(result).to.deep.equal([
            'dev.jtong.training.demo.smart.domain.persistent.model.user.mybatis.*',
            'org.springframework.beans.factory.annotation.Autowired',
            'org.springframework.http.HttpStatus',
            'org.springframework.http.ResponseEntity',
            'org.springframework.web.bind.annotation.*'
        ]);
    });
})
;