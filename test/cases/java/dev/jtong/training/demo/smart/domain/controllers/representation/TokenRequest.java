package dev.jtong.training.demo.smart.domain.controllers.representation;

public class TokenRequest {
    private String password;

    // getters and setters


    public TokenRequest(String password) {
        this.password = password;
    }

    public TokenRequest() {
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
