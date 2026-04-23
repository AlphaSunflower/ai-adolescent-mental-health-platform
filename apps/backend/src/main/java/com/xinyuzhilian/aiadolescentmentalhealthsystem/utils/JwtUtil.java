package com.xinyuzhilian.aiadolescentmentalhealthsystem.utils;

import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

@Component  // 交给Spring管理，方便注入配置
@RequiredArgsConstructor
public class JwtUtil {

    // 注入配置类（Spring通过反射完成属性注入）
    private final JwtProperties jwtProperties;

    // 从配置中获取密钥（注意：HS256需要256位以上密钥，需确保配置的secret足够长）
    private Key getSignInKey() {
        byte[] keyBytes = jwtProperties.getSecret().getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * 生成JWT令牌（使用配置中的过期时间和签发者）
     */
    public String generateToken(Map claims) {
        return Jwts.builder()
                .setClaims(claims)
                .setIssuer(jwtProperties.getIssuer() != null ? jwtProperties.getIssuer() : "default")  // 从配置获取签发者
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtProperties.getExpiration()))
                // 从配置获取过期时间
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * 生成JWT令牌（支持自定义过期时间，单位毫秒）
     */
    public String generateToken(Map claims, long expirationMs) {
        return Jwts.builder()
                .setClaims(claims)
                .setIssuer(jwtProperties.getIssuer())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * 获取token剩余有效时间（单位毫秒）
     */
    public long getRemainingTimeMs(String token) {
        try {
            Claims claims = parse(token);
            Date expiration = claims.getExpiration();
            return Math.max(0, expiration.getTime() - System.currentTimeMillis());
        } catch (Exception e) {
            return 0;
        }
    }
    public String generateTokenBySubject(String username) {
        return Jwts.builder()
                //获取唯一标识符
                .setSubject(username)
                .setIssuer(jwtProperties.getIssuer())  // 从配置获取签发者
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtProperties.getExpiration()))  // 从配置获取过期时间
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // 以下方法与之前类似，仅使用注入的配置属性
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    //username已被删除--此函数在generateTokenBySubject
    public boolean validateToken(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username) && !isTokenExpired(token));
    }

    /**
     * 从 Token 提取用户ID
     */
    public Long extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        Object userId = claims.get("userId");
        if (userId == null) {
            userId = claims.get("id");
        }
        if (userId instanceof Integer) {
            return ((Integer) userId).longValue();
        }
        if (userId instanceof Number) {
            return ((Number) userId).longValue();
        }
        if (userId != null) {
            return Long.parseLong(userId.toString());
        }
        return null;
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);

    }
    public Claims parse(String token) {
        // 创建密钥对象（推荐方式）
        SecretKey key = Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));
        // 得到DefaultJwtParser
        Claims claims = Jwts.parserBuilder()
                // 设置签名的秘钥
                .setSigningKey(key)
                .build()
                // 设置需要解析的jwt
                .parseClaimsJws(token)
                .getBody();
        return claims;
    }
    /**
     * Token解密
     *
     * @param secretKey jwt秘钥 此秘钥一定要保留好在服务端, 不能暴露出去, 否则sign就可以被伪造, 如果对接多个客户端建议改造成多个
     * @param token     加密后的token
     * @return
     */
    public static Claims parseJWT(String secretKey, String token) {
        // 创建密钥对象（推荐方式）
        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
        // 得到DefaultJwtParser
        Claims claims = Jwts.parserBuilder()
                // 设置签名的秘钥
                .setSigningKey(key)
                .build()
                // 设置需要解析的jwt
                .parseClaimsJws(token)
                .getBody();
        return claims;
    }
}