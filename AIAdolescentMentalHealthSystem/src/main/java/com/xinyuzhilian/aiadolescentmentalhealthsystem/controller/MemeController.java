package com.xinyuzhilian.aiadolescentmentalhealthsystem.controller;


import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.Meme;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IMemeService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * <p>
 *  前端控制器
 * </p>
 *
 * @author 魏辰益
 * @since 2026-03-18
 */
@RestController
@RequestMapping("/meme")
@RequiredArgsConstructor
public class MemeController {

    private final IMemeService memeService;
    /**
     * 分页查询梗列表（查名称）
     *
     *
     */
    @GetMapping("/admin/list")
    @PreAuthorize("hasAnyRole('4')")
    public Result<PageResult<Meme>> list(Integer page, Integer size,String memeName){
        PageResult<Meme> memes = memeService.getMemes(page, size, memeName);
        return Result.success(memes);
    }

    /**
     * 添加梗
     */
    @PostMapping("/admin/save")
    @PreAuthorize("hasAnyRole('4')")
    public Result<String> add(@RequestBody Meme meme){
        if (meme == null || meme.getMeme() == null || meme.getMeme().trim().isEmpty()) {
            return Result.error("梗内容不能为空");
        }
        boolean save = memeService.save(meme);
        if (save){
            memeService.refreshCache();
            return Result.success("添加成功");
        }
        return Result.error("添加失败");
    }
    /**
     * 修改梗
     */
    @PreAuthorize("hasAnyRole('4')")
    @PostMapping("/admin/update")
    public Result<String> update(@RequestBody Meme meme){
        if (meme == null || meme.getId() == null) {
            return Result.error("参数错误");
        }
        boolean update = memeService.updateById(meme);
        if (update){
            memeService.refreshCache();
            return Result.success("修改成功");
        }
        return Result.error("修改失败");
    }
    /**
     * 删除梗
     */
    @DeleteMapping("/admin/{id}/delete")
    @PreAuthorize("hasAnyRole('4')")
    public Result<String> delete(@PathVariable Long id){
        boolean b = memeService.removeById(id);
        if (b){
            memeService.refreshCache();
            return Result.success("删除成功");
        }
        return Result.error("删除失败");
    }
    
    /**
     * 手动刷新缓存
     */
    @PostMapping("/admin/cache/refresh")
    @PreAuthorize("hasAnyRole('4')")
    public Result<String> refreshCache(){
        memeService.refreshCache();
        return Result.success("缓存已刷新");
    }
    
    /**
     * 获取缓存中的 meme
     */
    @GetMapping("/{id}/text")
    public Result<String> getMemeText(@PathVariable Long id){
        String meme = memeService.getMemeById(id);
        if (meme != null) {
            return Result.success(meme);
        }
        return Result.error("未找到该 meme");
    }

    /**
     * 文本批量识别梗（每批最多5句）
     */
    @PostMapping("/recognize")
    public Result<java.util.List<java.util.List<java.util.Map<String,Object>>>> recognize(@RequestBody java.util.Map<String, java.util.List<String>> body){
        java.util.List<String> texts = body.get("texts");
        return Result.success(memeService.recognizeMemesBatch(texts));
    }

    /**
     * 获取梗详情（普通用户）
     */
    @GetMapping("/{id}")
    public Result<Meme> getDetailUser(@PathVariable Long id){
        Meme meme = memeService.getById(id);
        return Result.success(meme);
    }
    /**
     * 获取梗详情（管理员）
     */
    @GetMapping("/admin/{id}")
    @PreAuthorize("hasAnyRole('2','3','4')")
    public Result<Meme> getDetail(@PathVariable Long id){
        Meme meme = memeService.getById(id);
        return Result.success(meme);
    }

}
