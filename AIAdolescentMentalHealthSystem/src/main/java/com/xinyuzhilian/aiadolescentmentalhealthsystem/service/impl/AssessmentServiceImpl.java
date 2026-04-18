package com.xinyuzhilian.aiadolescentmentalhealthsystem.service.impl;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.PageResult;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.common.Result;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.AssessmentRecord;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.pojo.AssessmentTemplate;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.AssessmentRecordMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper.AssessmentTemplateMapper;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.service.IAssessmentService;
import com.xinyuzhilian.aiadolescentmentalhealthsystem.domain.content.vo.AssessmentRecordVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssessmentServiceImpl implements IAssessmentService {

    private final AssessmentTemplateMapper templateMapper;
    private final AssessmentRecordMapper recordMapper;

    @Override
    public PageResult<AssessmentTemplate> getAdminTemplates(Integer page, Integer size, String title) {
        Page<AssessmentTemplate> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<AssessmentTemplate> wrapper = new LambdaQueryWrapper<>();
        if (title != null && !title.isEmpty()) {
            wrapper.like(AssessmentTemplate::getTitle, title);
        }
        wrapper.orderByDesc(AssessmentTemplate::getCreateTime);
        return PageResult.build(templateMapper.selectPage(pageParam, wrapper));
    }

    @Override
    public void saveTemplate(AssessmentTemplate template) {
        if (template.getId() == null) {
            template.setCreateTime(LocalDateTime.now());
            templateMapper.insert(template);
        } else {
            templateMapper.updateById(template);
        }
    }

    @Override
    public void deleteTemplate(Long id) {
        templateMapper.deleteById(id);
    }

    @Override
    public Result<AssessmentTemplate> getTemplate(Long id) {
        AssessmentTemplate template = templateMapper.selectById(id);
        if (template == null) {
            return Result.error("量表不存在");
        }
        return Result.success(template);
    }

    @Override
    public Result<java.util.List<AssessmentTemplate>> getPublicTemplates() {
        LambdaQueryWrapper<AssessmentTemplate> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(AssessmentTemplate::getStatus, 1); // 启用状态
        wrapper.eq(AssessmentTemplate::getIsPublic, 1); // 公开状态
        wrapper.orderByDesc(AssessmentTemplate::getCreateTime);
        return Result.success(templateMapper.selectList(wrapper));
    }

    @Override
    public Result<AssessmentRecord> submitAssessment(Long userId, Long templateId, Long patientContactId, Object answers) {
        AssessmentTemplate template = templateMapper.selectById(templateId);
        if (template == null) {
            return Result.error("量表不存在");
        }

        int totalScore = 0;
        try {
            JSONObject answersJson = JSON.parseObject(JSON.toJSONString(answers));
            // 简单累加所有值的整数部分
            for (Map.Entry<String, Object> entry : answersJson.entrySet()) {
                Object value = entry.getValue();
                if (value instanceof Number) {
                    totalScore += ((Number) value).intValue();
                } else if (value instanceof String) {
                    try {
                        totalScore += Integer.parseInt((String) value);
                    } catch (NumberFormatException ignored) {}
                }
            }
        } catch (Exception e) {
            // 解析失败，分数默认为0
        }

        // 解析计分规则生成分析结论
        String analysis = "您的得分是：" + totalScore + "。建议咨询专业医生。";
        try {
            Object scoringRulesObj = template.getScoringRulesJson();
            if (scoringRulesObj != null) {
                String rulesStr = scoringRulesObj instanceof String ? (String) scoringRulesObj : JSON.toJSONString(scoringRulesObj);
                JSONObject rulesJson = JSON.parseObject(rulesStr);
                com.alibaba.fastjson2.JSONArray ranges = rulesJson.getJSONArray("rules");
                if (ranges != null) {
                    for (int i = 0; i < ranges.size(); i++) {
                        JSONObject range = ranges.getJSONObject(i);
                        int min = range.getIntValue("min");
                        int max = range.getIntValue("max");
                        if (totalScore >= min && totalScore <= max) {
                            analysis = range.getString("analysis");
                            String level = range.getString("level");
                            if (level != null) {
                                analysis = "【" + level + "】" + analysis;
                            }
                            break;
                        }
                    }
                }
            }
        } catch (Exception e) {
            // 解析规则失败，使用默认结论
        }

        AssessmentRecord record = new AssessmentRecord();
        record.setUserId(userId);
        record.setTemplateId(templateId);
        record.setPatientContactId(patientContactId); // 新增关联
        record.setAnswersJson(JSON.toJSONString(answers));
        record.setResultScore(totalScore);
        record.setResultAnalysis(analysis);
        record.setCreateTime(LocalDateTime.now());

        recordMapper.insert(record);

        return Result.success(record);
    }

    @Override
    public Result<PageResult<AssessmentRecordVO>> getUserRecords(Long userId, Integer page, Integer size, Long patientContactId) {
        Page<AssessmentRecord> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<AssessmentRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(AssessmentRecord::getUserId, userId);
        if (patientContactId != null) {
            wrapper.eq(AssessmentRecord::getPatientContactId, patientContactId);
        }
        wrapper.orderByDesc(AssessmentRecord::getCreateTime);
        
        Page<AssessmentRecord> recordPage = recordMapper.selectPage(pageParam, wrapper);
        
        List<AssessmentRecordVO> voList = recordPage.getRecords().stream().map(record -> {
            AssessmentRecordVO vo = new AssessmentRecordVO();
            vo.setRecord(record);
            AssessmentTemplate template = templateMapper.selectById(record.getTemplateId());
            if (template != null) {
                vo.setTemplateTitle(template.getTitle());
            }
            return vo;
        }).collect(Collectors.toList());
        
        PageResult<AssessmentRecordVO> result = new PageResult<>();
        result.setRecords(voList);
        result.setTotal(recordPage.getTotal());
        result.setSize(recordPage.getSize());
        result.setCurrent(recordPage.getCurrent());
        result.setPages(recordPage.getPages());
        
        return Result.success(result);
    }

    @Override
    public Result<AssessmentRecordVO> getRecordDetail(Long recordId, Long userId) {
        AssessmentRecord record = recordMapper.selectById(recordId);
        if (record == null || !record.getUserId().equals(userId)) {
            return Result.error("记录不存在或无权访问");
        }
        
        AssessmentRecordVO vo = new AssessmentRecordVO();
        vo.setRecord(record);
        AssessmentTemplate template = templateMapper.selectById(record.getTemplateId());
        if (template != null) {
            vo.setTemplateTitle(template.getTitle());
        }
        return Result.success(vo);
    }
}